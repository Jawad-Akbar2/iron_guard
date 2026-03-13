import { useState } from 'react';
import { transactionAPI, accountsAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/calculator.js';
import { useModalManager } from '../../hooks/useModalManager.js';

export const AddPaymentModal = ({ modalName, onSuccess }) => {
  const [accountType, setAccountType] = useState('customer');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUIStore();
  const queryClient = useQueryClient();
  const { closeModal: closeOnEsc } = useModalManager(modalName);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-all'],
    queryFn: () => accountsAPI.getAllAccounts({ limit: 1000 })
  });

  const accounts = accountsData?.data?.accounts?.filter(a => a.accountType === accountType) || [];
  const selectedAcc = accounts.find(a => a._id === selectedAccount);
  const amountRounded = Math.round(amount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount || !amountRounded) {
      toast.error('Please select account and enter amount');
      return;
    }

    setIsLoading(true);
    try {
      await transactionAPI.createTransaction({
        type: 'payment',
        accountType: accountType,
        accountId: selectedAccount,
        items: [],
        notes: notes.trim(),
        paymentType: paymentType,
        paymentTransactionId: paymentTransactionId.trim() || '',
        paidAmount: amountRounded
      });

      // Invalidate queries for real-time updates
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
      await queryClient.invalidateQueries({ queryKey: ['account-ledger'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });

      toast.success('Payment recorded successfully');
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Record Payment</h2>
          <button
            onClick={() => closeModal(modalName)}
            className="hover:bg-green-700 p-2 rounded transition"
            title="Close (ESC)"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Account Type *</label>
            <select
              value={accountType}
              onChange={(e) => {
                setAccountType(e.target.value);
                setSelectedAccount('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select {accountType === 'customer' ? 'Customer' : 'Supplier'} *
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            >
              <option value="">Choose...</option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.name} ({accountType === 'customer' ? account.customerId : account.supplierId}) - Due: {formatCurrency(account.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          {selectedAcc && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-gray-600">Current Balance</p>
              <p className={`text-lg font-bold ${selectedAcc.currentBalance > 0 ? 'text-red-600' : selectedAcc.currentBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {formatCurrency(selectedAcc.currentBalance)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Amount *</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Math.round(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-right text-lg font-bold"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Type *</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {paymentType !== 'Cash' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payment ID</label>
              <input
                type="text"
                value={paymentTransactionId}
                onChange={(e) => setPaymentTransactionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Reference number"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              placeholder="Payment notes..."
              rows="2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => closeModal(modalName)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedAccount || !amountRounded}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};