import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionAPI, customerAPI, supplierAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatDateTime, formatCurrency } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';

export const DailyLedgerPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentType: '',
    entityType: '',
    page: 1,
    limit: 50
  });
  const { openModal } = useUIStore();

  const { data: ledgerData, isLoading, refetch } = useQuery({
    queryKey: ['daily-ledger', filters],
    queryFn: () => transactionAPI.getAllTransactions(filters),
    staleTime: 5 * 60 * 1000
  });

  const transactions = ledgerData?.data?.transactions || [];
  const pagination = ledgerData?.data?.pagination || {};

  const handleAddTransaction = () => {
    openModal('addTransaction');
  };

  const handleViewReceipt = (txnId) => {
    openModal('transactionReceipt', { txnId });
  };

  const handleEditTransaction = (transaction) => {
    openModal('editTransaction', transaction);
  };

  const handleDeleteTransaction = async (txnId) => {
    if (window.confirm('Delete this transaction? Stock will be reversed.')) {
      try {
        await transactionAPI.softDeleteTransaction(txnId);
        toast.success('Transaction deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const csv = [
      ['Transaction ID', 'Date & Time', 'Type', 'Customer/Supplier', 'Items', 'Quantity', 'Discount', 'Total', 'Payment Type', 'Paid', 'Balance', 'Profit'],
      ...transactions.map(txn => [
        txn.transactionId,
        formatDateTime(txn.createdAt),
        txn.type,
        txn.entityType,
        txn.items.map(i => i.name).join(';'),
        txn.items.reduce((sum, i) => sum + i.quantity, 0),
        formatCurrency(txn.discount),
        formatCurrency(txn.totalAmount),
        txn.paymentType,
        formatCurrency(txn.paidAmount),
        formatCurrency(txn.remainingBalance),
        formatCurrency(txn.profit)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-ledger-${Date.now()}.csv`;
    a.click();
    toast.success('Ledger exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Daily Ledger</h1>
        <button
          onClick={handleAddTransaction}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-2 flex-wrap">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="End Date"
        />
        <select
          value={filters.entityType}
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Types</option>
          <option value="customer">Customers</option>
          <option value="supplier">Suppliers</option>
        </select>
        <select
          value={filters.paymentType}
          onChange={(e) => setFilters({ ...filters, paymentType: e.target.value, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Payment Types</option>
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
          <option value="EasyPaisa">EasyPaisa</option>
        </select>
        <button
          onClick={handleExportCSV}
          className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={12} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Txn ID</th>
                    <th className="px-4 py-2 text-left">Date & Time</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Entity</th>
                    <th className="px-4 py-2 text-left">Items</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Discount</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-left">Payment</th>
                    <th className="px-4 py-2 text-right">Paid</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{txn.transactionId}</td>
                      <td className="px-4 py-2 text-xs">{formatDateTime(txn.createdAt)}</td>
                      <td className="px-4 py-2 text-xs capitalize"><span className={`px-2 py-1 rounded text-white ${txn.type === 'sale' ? 'bg-blue-500' : txn.type === 'purchase' ? 'bg-orange-500' : 'bg-red-500'}`}>{txn.type}</span></td>
                      <td className="px-4 py-2 text-xs capitalize">{txn.entityType}</td>
                      <td className="px-4 py-2 text-xs">{txn.items.map(i => i.name).join(', ')}</td>
                      <td className="px-4 py-2 text-right text-xs">{txn.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                      <td className="px-4 py-2 text-right text-xs">{formatCurrency(txn.discount)}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium">{formatCurrency(txn.totalAmount)}</td>
                      <td className="px-4 py-2 text-xs">{txn.paymentType}</td>
                      <td className="px-4 py-2 text-right text-xs">{formatCurrency(txn.paidAmount)}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium text-blue-600">{formatCurrency(txn.remainingBalance)}</td>
                      <td className="px-4 py-2 text-center space-x-1">
                        <button
                          onClick={() => handleViewReceipt(txn.transactionId)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                          title="View Receipt"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditTransaction(txn)}
                          className="text-green-600 hover:bg-green-50 p-1 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(txn.transactionId)}
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
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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