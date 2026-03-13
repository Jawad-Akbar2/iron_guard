import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsAPI } from '../services/api.js';  // ✅ FIXED: 2 levels up
import { useUIStore } from '../store/uiStore.js';  // ✅ FIXED: 2 levels up
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';  // ✅ FIXED: 1 level up
import { formatDateTime, formatCurrency } from '../utils/dateFormatter.js';  // ✅ FIXED: 2 levels up
import toast from 'react-hot-toast';
import { Plus, Eye, Edit2, Trash2, ShoppingCart } from 'lucide-react';

export const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const { openModal } = useUIStore();
  const queryClient = useQueryClient();

  const filters = {
    type: activeTab === 'all' ? undefined : activeTab === 'customer' ? 'customer' : 'supplier',
    search: searchTerm,
    balanceStatus: balanceFilter || undefined,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page,
    limit: 50
  };

  const { data: accountsData, isLoading, refetch } = useQuery({
    queryKey: ['accounts', filters],
    queryFn: () => accountsAPI.getAllAccounts(filters),
    staleTime: 5 * 60 * 1000
  });

  const accounts = accountsData?.data?.accounts || [];
  const pagination = accountsData?.data?.pagination || {};

  const handleViewAccount = (account) => {
    openModal('accountLedger', { 
      accountId: account._id,
      accountType: account.accountType,
      accountName: account.name
    });
  };

  const handleAddTransaction = (account) => {
    openModal('addTransaction', {
      preselectedAccount: account._id,
      preselectedAccountType: account.accountType
    });
  };

  const handleEditAccount = (account) => {
    if (account.accountType === 'customer') {
      openModal('editCustomer', account);
    } else {
      openModal('editSupplier', account);
    }
  };

  const handleDeleteAccount = async (account) => {
    if (window.confirm(`Delete ${account.name}? This cannot be undone.`)) {
      try {
        if (account.accountType === 'customer') {
          await accountsAPI.deleteCustomer(account._id);
        } else {
          await accountsAPI.deleteSupplier(account._id);
        }
        toast.success('Account deleted');
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
        refetch();
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  const handleQuickAdd = (type) => {
    if (type === 'customer') {
      openModal('addCustomer');
    } else if (type === 'supplier') {
      openModal('addSupplier');
    }
  };

  const totalAccounts = accounts.length;
  const positiveBalance = accounts.filter(a => a.currentBalance > 0).length;
  const negativeBalance = accounts.filter(a => a.currentBalance < 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickAdd('customer')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Plus size={18} />
            Customer
          </button>
          <button
            onClick={() => handleQuickAdd('supplier')}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm"
          >
            <Plus size={18} />
            Supplier
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Total Accounts</p>
          <p className="text-2xl font-bold text-blue-900">{totalAccounts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Positive Balance</p>
          <p className="text-2xl font-bold text-green-900">{positiveBalance}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Negative Balance</p>
          <p className="text-2xl font-bold text-red-900">{negativeBalance}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <input
          type="text"
          placeholder="Search by ID, Name, Phone, or Address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Customers', value: 'customer' },
              { label: 'Suppliers', value: 'supplier' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={balanceFilter}
            onChange={(e) => {
              setBalanceFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Balances</option>
            <option value="positive">Positive Balance</option>
            <option value="negative">Negative Balance</option>
            <option value="zero">Zero Balance</option>
          </select>

          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => {
              setDateRange({ ...dateRange, startDate: e.target.value });
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => {
              setDateRange({ ...dateRange, endDate: e.target.value });
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={8} />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No accounts found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold border border-gray-200">Account ID</th>
                    <th className="px-4 py-3 text-left font-semibold border border-gray-200">Name</th>
                    <th className="px-4 py-3 text-left font-semibold border border-gray-200">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold border border-gray-200">Address</th>
                    <th className="px-4 py-3 text-left font-semibold border border-gray-200">Created</th>
                    <th className="px-4 py-3 text-right font-semibold border border-gray-200">Balance</th>
                    <th className="px-4 py-3 text-center font-semibold border border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-mono border border-gray-200">
                        {account.accountType === 'customer' ? account.customerId : account.supplierId}
                      </td>
                      <td className="px-4 py-3 text-sm border border-gray-200">{account.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{account.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{account.address || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 border border-gray-200">{formatDateTime(account.createdAt)}</td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold border border-gray-200 ${
                        account.currentBalance > 0 ? 'text-red-600' :
                        account.currentBalance < 0 ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {formatCurrency(account.currentBalance)}
                      </td>
                      <td className="px-4 py-3 text-center border border-gray-200">
  <div className="flex items-center justify-center gap-1">
    {/* Add button first */}
    <button
      onClick={() => handleAddTransaction(account)}
      className="text-white bg-green-600 hover:bg-green-700 p-2 rounded transition flex items-center justify-center"
      title="Add Transaction"
    >
      Add
    </button>

    {/* View Ledger */}
    <button
      onClick={() => handleViewAccount(account)}
      className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
      title="View Ledger"
    >
      <Eye size={18} />
    </button>

    {/* Edit */}
    <button
      onClick={() => handleEditAccount(account)}
      className="text-amber-600 hover:bg-amber-50 p-2 rounded transition"
      title="Edit"
    >
      <Edit2 size={18} />
    </button>

    {/* Delete */}
    <button
      onClick={() => handleDeleteAccount(account)}
      className="text-red-600 hover:bg-red-50 p-2 rounded transition"
      title="Delete"
    >
      <Trash2 size={18} />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
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