import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionAPI, accountsAPI, itemAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatDateTime, formatCurrency } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';

export const TransactionsPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    accountType: '',
    customerId: '',
    supplierId: '',
    itemId: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 50
  });
  const { openModal } = useUIStore();

  // Fetch transactions
  const { data: transactionsData, isLoading: txnLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['all-transactions', filters],
    queryFn: () => transactionAPI.getAllTransactions(filters),
    staleTime: 5 * 60 * 1000
  });

  // Fetch customers for dropdown
  const { data: customersData } = useQuery({
    queryKey: ['customers-dropdown'],
    queryFn: () => accountsAPI.getAllAccounts({ type: 'customer', limit: 1000 }),
    staleTime: 10 * 60 * 1000
  });

  // Fetch suppliers for dropdown
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-dropdown'],
    queryFn: () => accountsAPI.getAllAccounts({ type: 'supplier', limit: 1000 }),
    staleTime: 10 * 60 * 1000
  });

  // Fetch items for dropdown
  const { data: itemsData } = useQuery({
    queryKey: ['items-dropdown'],
    queryFn: () => itemAPI.getAllItems(1, 1000),
    staleTime: 10 * 60 * 1000
  });

  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination || {};
  const customers = customersData?.data?.accounts?.filter(a => a.accountType === 'customer') || [];
  const suppliers = suppliersData?.data?.accounts?.filter(a => a.accountType === 'supplier') || [];
  const items = itemsData?.data?.items || [];

  const handleDeleteTransaction = async (txnId) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await transactionAPI.softDeleteTransaction(txnId);
        toast.success('Transaction deleted');
        refetchTransactions();
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
      ['Date', 'Transaction ID', 'Type', 'Account', 'Items', 'Qty', 'Unit', 'Price', 'Total', 'Balance'],
      ...transactions.map(txn => [
        formatDateTime(txn.createdAt),
        txn.transactionId,
        txn.type,
        txn.accountName,
        txn.items.map(i => i.itemName).join(';'),
        txn.items.reduce((sum, i) => sum + i.quantity, 0),
        txn.items.length > 0 ? txn.items[0].unit : '-',
        txn.items.length > 0 ? formatCurrency(txn.items[0].price) : '-',
        formatCurrency(txn.totalAmount),
        formatCurrency(txn.finalBalance)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
    toast.success('Transactions exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => openModal('addTransaction')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4 border border-gray-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Transaction ID, Account Name, or Item..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Filter Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="payment">Payments</option>
            <option value="return">Returns</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            value={filters.customerId}
            onChange={(e) => setFilters({ ...filters, customerId: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Customers</option>
            {customers.map(c => (
              <option key={c._id} value={c.customerId}>
                {c.name} ({c.customerId})
              </option>
            ))}
          </select>

          <select
            value={filters.supplierId}
            onChange={(e) => setFilters({ ...filters, supplierId: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s._id} value={s.supplierId}>
                {s.name} ({s.supplierId})
              </option>
            ))}
          </select>

          <select
            value={filters.itemId}
            onChange={(e) => setFilters({ ...filters, itemId: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Items</option>
            {items.map(i => (
              <option key={i._id} value={i._id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {txnLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={10} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Date</th>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Txn ID</th>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Type</th>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Account</th>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Items</th>
                    <th className="px-4 py-2 text-right border border-gray-300 font-medium">Qty</th>
                    <th className="px-4 py-2 text-left border border-gray-300 font-medium">Unit</th>
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
                      <td className="px-4 py-2 text-xs border border-gray-300">{txn.accountName}</td>
                      <td className="px-4 py-2 text-xs border border-gray-300">
                        {txn.items.map(i => i.itemName).join(', ')}
                      </td>
                      <td className="px-4 py-2 text-right text-xs border border-gray-300">
                        {txn.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </td>
                      <td className="px-4 py-2 text-left text-xs border border-gray-300">
                        {txn.items.length > 0 ? txn.items[0].unit : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-xs border border-gray-300">
                        {txn.items.length > 0 ? formatCurrency(txn.items[0].price) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right text-xs font-medium border border-gray-300">
                        {formatCurrency(txn.totalAmount)}
                      </td>
                      <td className={`px-4 py-2 text-right text-xs font-medium border border-gray-300 ${
                        txn.finalBalance > 0 ? 'text-green-600' :
                        txn.finalBalance < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {formatCurrency(txn.finalBalance)}
                      </td>
                      <td className="px-4 py-2 text-center space-x-1 border border-gray-300">
                        <button
                          onClick={() => openModal('transactionReceipt', { txnId: txn.transactionId })}
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
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition"
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