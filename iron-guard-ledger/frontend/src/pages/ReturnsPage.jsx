import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatDateTime, formatCurrency } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';

export const ReturnsPage = () => {
  const [filters, setFilters] = useState({
    type: 'return',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const { openModal } = useUIStore();

  const { data: returnsData, isLoading, refetch } = useQuery({
    queryKey: ['returns', filters],
    queryFn: () => transactionAPI.getAllTransactions(filters),
    staleTime: 5 * 60 * 1000
  });

  const transactions = returnsData?.data?.transactions || [];
  const pagination = returnsData?.data?.pagination || {};

  const totalReturnsAmount = transactions.reduce((sum, t) => sum + Math.abs(t.totalAmount || 0), 0);

  const handleAddReturn = () => {
    openModal('addReturn');
  };

  const handleViewReceipt = (txnId) => {
    openModal('transactionReceipt', { txnId });
  };

  const handleEditReturn = (transaction) => {
    openModal('editReturn', transaction);
  };

  const handleDeleteReturn = async (txnId) => {
    if (window.confirm('Delete this return?')) {
      try {
        await transactionAPI.softDeleteTransaction(txnId);
        toast.success('Return deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete return');
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('No returns to export');
      return;
    }

    const csv = [
      ['Transaction ID', 'Date & Time', 'Entity', 'Items', 'Quantity', 'Total', 'Adjusted Balance'],
      ...transactions.map(txn => [
        txn.transactionId,
        formatDateTime(txn.createdAt),
        txn.entityType,
        txn.items.map(i => i.name).join(';'),
        txn.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0),
        formatCurrency(Math.abs(txn.totalAmount)),
        formatCurrency(txn.remainingBalance)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returns-${Date.now()}.csv`;
    a.click();
    toast.success('Returns exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Returns & Adjustments</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handleAddReturn}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Return
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
        <p className="text-sm opacity-90">Total Returns</p>
        <p className="text-3xl font-bold">{formatCurrency(totalReturnsAmount)}</p>
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
          <div className="p-6 text-center text-gray-500">No returns found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Txn ID</th>
                    <th className="px-4 py-2 text-left">Date & Time</th>
                    <th className="px-4 py-2 text-left">Entity</th>
                    <th className="px-4 py-2 text-left">Items</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Return Amount</th>
                    <th className="px-4 py-2 text-right">Adjusted Balance</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{txn.transactionId}</td>
                      <td className="px-4 py-2 text-xs">{formatDateTime(txn.createdAt)}</td>
                      <td className="px-4 py-2 text-xs capitalize">{txn.entityType}</td>
                      <td className="px-4 py-2 text-xs">{txn.items.map(i => i.name).join(', ')}</td>
                      <td className="px-4 py-2 text-right text-xs">{txn.items.reduce((sum, i) => sum + Math.abs(i.quantity), 0)}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium text-red-600">{formatCurrency(Math.abs(txn.totalAmount))}</td>
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
                          onClick={() => handleEditReturn(txn)}
                          className="text-green-600 hover:bg-green-50 p-1 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReturn(txn.transactionId)}
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