import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatDateTime, formatCurrency } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';

export const PaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'payment',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const { openModal } = useUIStore();

  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => transactionAPI.getAllTransactions(filters),
    staleTime: 5 * 60 * 1000
  });

  const transactions = paymentsData?.data?.transactions || [];
  const pagination = paymentsData?.data?.pagination || {};

  const totalPayments = transactions.reduce((sum, t) => sum + (t.paidAmount || 0), 0);

  const handleAddPayment = () => {
    openModal('addPayment');
  };

  const handleViewReceipt = (txnId) => {
    openModal('transactionReceipt', { txnId });
  };

  const handleEditPayment = (transaction) => {
    openModal('editPayment', transaction);
  };

  const handleDeletePayment = async (txnId) => {
    if (window.confirm('Delete this payment?')) {
      try {
        await transactionAPI.softDeleteTransaction(txnId);
        toast.success('Payment deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No payments to export');
      return;
    }

    const csv = [
      ['Transaction ID', 'Date & Time', 'Type', 'Entity', 'Payment Type', 'Payment ID', 'Amount', 'Discount'],
      ...transactions.map(txn => [
        txn.transactionId,
        formatDateTime(txn.createdAt),
        txn.type,
        txn.entityType,
        txn.paymentType,
        txn.paymentTransactionId || '-',
        formatCurrency(txn.paidAmount),
        formatCurrency(txn.discount)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${Date.now()}.csv`;
    a.click();
    toast.success('Payments exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handleAddPayment}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Payment
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <p className="text-sm opacity-90">Total Payments</p>
        <p className="text-3xl font-bold">{formatCurrency(totalPayments)}</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-2 flex-wrap">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={8} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No payments found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Txn ID</th>
                    <th className="px-4 py-2 text-left">Date & Time</th>
                    <th className="px-4 py-2 text-left">Entity</th>
                    <th className="px-4 py-2 text-left">Payment Type</th>
                    <th className="px-4 py-2 text-left">Payment ID</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-right">Discount</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{txn.transactionId}</td>
                      <td className="px-4 py-2 text-xs">{formatDateTime(txn.createdAt)}</td>
                      <td className="px-4 py-2 text-xs capitalize">{txn.entityType}</td>
                      <td className="px-4 py-2 text-xs"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{txn.paymentType}</span></td>
                      <td className="px-4 py-2 text-xs font-mono">{txn.paymentTransactionId || '-'}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium text-green-600">{formatCurrency(txn.paidAmount)}</td>
                      <td className="px-4 py-2 text-right text-xs">{formatCurrency(txn.discount)}</td>
                      <td className="px-4 py-2 text-center space-x-1">
                        <button
                          onClick={() => handleViewReceipt(txn.transactionId)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditPayment(txn)}
                          className="text-green-600 hover:bg-green-50 p-1 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(txn.transactionId)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};