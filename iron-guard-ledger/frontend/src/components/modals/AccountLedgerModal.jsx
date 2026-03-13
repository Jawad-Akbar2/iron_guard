import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { SkeletonLoader } from '../SkeletonLoader.jsx';
import { formatDateTime, formatCurrency } from '../../utils/dateFormatter.js';
import { X, Eye, Edit2, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const AccountLedgerModal = ({ data }) => {
  const { closeModal, openModal } = useUIStore();
  const [filters, setFilters] = useState({
    transactionType: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 50
  });

  const accountId = data?.accountId;
  const accountType = data?.accountType;

  const { data: ledgerData, isLoading, refetch } = useQuery({
    queryKey: ['account-ledger', accountId, accountType, filters],
    queryFn: () => accountsAPI.getAccountLedger(accountType, accountId, filters),
    enabled: !!accountId && !!accountType,
    staleTime: 5 * 60 * 1000
  });

  const account = ledgerData?.data?.[accountType === 'customer' ? 'customer' : 'supplier'];
  const transactions = ledgerData?.data?.transactions || [];
  const summary = ledgerData?.data?.summary || {};
  const pagination = ledgerData?.data?.pagination || {};

  const handleViewReceipt = (txnId) => {
    openModal('transactionReceipt', { txnId });
  };

  const handleDeleteTransaction = async (txnId) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await accountsAPI.softDeleteTransaction?.(txnId) || transactionAPI.softDeleteTransaction(txnId);
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
      ['Date', 'Txn ID', 'Type', 'Items', 'Qty', 'Price', 'Total', 'Running Balance'],
      ...transactions.map(txn => [
        formatDateTime(txn.createdAt),
        txn.transactionId,
        txn.type,
        txn.items.map(i => i.itemName).join(';'),
        txn.items.reduce((sum, i) => sum + i.quantity, 0),
        txn.items.length > 0 ? txn.items[0].price : '-',
        txn.totalAmount,
        txn.finalBalance
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${accountType}-${Date.now()}.csv`;
    a.click();
    toast.success('Ledger exported');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Account Ledger</h2>
          <button
            onClick={() => closeModal('accountLedger')}
            className="hover:bg-blue-700 p-2 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Account Summary Panel */}
        {account && !isLoading && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium">Account Name</p>
                <p className="text-sm font-bold text-gray-900">{account.name}</p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium">Account ID</p>
                <p className="text-sm font-mono font-bold text-gray-900">
                  {accountType === 'customer' ? account.customerId : account.supplierId}
                </p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium">Phone</p>
                <p className="text-sm text-gray-900">{account.phone || '-'}</p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600 font-medium">Address</p>
                <p className="text-sm text-gray-900">{account.address || '-'}</p>
              </div>
              <div className={`bg-white rounded p-3 border-2 ${account.currentBalance > 0 ? 'border-red-300' : account.currentBalance < 0 ? 'border-green-300' : 'border-gray-300'}`}>
                <p className="text-xs text-gray-600 font-medium">Current Balance</p>
                <p className={`text-sm font-bold ${account.currentBalance > 0 ? 'text-red-600' : account.currentBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {formatCurrency(account.currentBalance)}
                </p>
              </div>
            </div>

            {/* Summary Totals */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Total {accountType === 'customer' ? 'Orders' : 'Purchases'}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalOrders || 0)}</p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Total Payments</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalPayments || 0)}</p>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <p className="text-xs text-gray-600">Total Returns</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalReturns || 0)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="border-b p-4 bg-gray-50 flex gap-2 flex-wrap">
          <select
            value={filters.transactionType}
            onChange={(e) => setFilters({ ...filters, transactionType: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="payment">Payments</option>
            <option value="return">Returns</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="Search Txn ID or Item..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleExportCSV}
            className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader rows={5} columns={9} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No transactions found</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left border border-gray-300 font-medium">Date</th>
                  <th className="px-4 py-2 text-left border border-gray-300 font-medium">Txn ID</th>
                  <th className="px-4 py-2 text-left border border-gray-300 font-medium">Type</th>
                  <th className="px-4 py-2 text-left border border-gray-300 font-medium">Items</th>
                  <th className="px-4 py-2 text-right border border-gray-300 font-medium">Qty</th>
                  <th className="px-4 py-2 text-right border border-gray-300 font-medium">Price</th>
                  <th className="px-4 py-2 text-right border border-gray-300 font-medium">Total</th>
                  <th className="px-4 py-2 text-right border border-gray-300 font-medium">Balance</th>
                  <th className="px-4 py-2 text-center border border-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs border border-gray-300">{formatDateTime(txn.createdAt)}</td>
                    <td className="px-4 py-2 text-xs font-mono border border-gray-300">{txn.transactionId}</td>
                    <td className="px-4 py-2 text-xs border border-gray-300">
                      <span className={`px-2 py-1 rounded text-white text-xs font-medium ${
                        txn.type === 'sale' ? 'bg-blue-500' :
                        txn.type === 'purchase' ? 'bg-orange-500' :
                        txn.type === 'payment' ? 'bg-green-500' :
                        txn.type === 'return' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs border border-gray-300">
                      {txn.items.map(i => i.itemName).join(', ')}
                    </td>
                    <td className="px-4 py-2 text-right text-xs border border-gray-300">
                      {txn.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs border border-gray-300">
                      {txn.items.length > 0 ? formatCurrency(txn.items[0].price) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-medium border border-gray-300">
                      {formatCurrency(txn.totalAmount)}
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-medium text-blue-600 border border-gray-300">
                      {formatCurrency(txn.finalBalance)}
                    </td>
                    <td className="px-4 py-2 text-center space-x-1 border border-gray-300">
                      <button
                        onClick={() => handleViewReceipt(txn.transactionId)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(txn.transactionId)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-white transition"
              >
                Prev
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};