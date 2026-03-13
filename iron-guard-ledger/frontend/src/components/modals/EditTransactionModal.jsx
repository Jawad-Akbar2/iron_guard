import { useState, useEffect } from 'react';
import { transactionAPI, itemAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { useQuery } from '@tanstack/react-query';
import { X, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateTotalAmount } from '../../utils/calculator.js';

export const EditTransactionModal = ({ modalName, data, onSuccess }) => {
  const [paymentType, setPaymentType] = useState('Cash');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUIStore();

  // Fetch items
  const { data: itemsData } = useQuery({
    queryKey: ['items-all'],
    queryFn: () => itemAPI.getAllItems(1, 1000)
  });

  const allItems = itemsData?.data?.items || [];

  useEffect(() => {
    if (data) {
      setPaymentType(data.paymentType || 'Cash');
      setPaymentTransactionId(data.paymentTransactionId || '');
      setPaidAmount(data.paidAmount || 0);
      setDiscount(data.discount || 0);
      setItems(data.items || []);
    }
  }, [data]);

  const totalAmount = items.reduce((sum, item) => {
    return sum + calculateTotalAmount(item.quantity, item.rate, item.discount);
  }, 0);

  const remainingBalance = totalAmount - discount - paidAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Transaction must have at least one item');
      return;
    }

    setIsLoading(true);
    try {
      await transactionAPI.updateTransaction(data.transactionId, {
        items,
        paymentType,
        paymentTransactionId,
        paidAmount: parseFloat(paidAmount) || 0,
        discount: parseFloat(discount) || 0
      });

      toast.success('Transaction updated successfully');
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Transaction</h2>
          <button
            onClick={() => closeModal(modalName)}
            className="hover:bg-green-700 p-2 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Info (Read-only) */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Transaction ID</p>
              <p className="font-mono text-sm font-bold">{data?.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Type</p>
              <p className="text-sm font-bold capitalize">{data?.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Created By</p>
              <p className="text-sm font-bold">{data?.createdBy?.name}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
            <div className="border border-gray-300 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left">Item</th>
                    <th className="px-2 py-2 text-right">Qty</th>
                    <th className="px-2 py-2 text-left">Unit</th>
                    <th className="px-2 py-2 text-right">Rate</th>
                    <th className="px-2 py-2 text-right">Discount</th>
                    <th className="px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-2 text-xs">{item.name}</td>
                      <td className="px-2 py-2 text-right text-xs">{item.quantity}</td>
                      <td className="px-2 py-2 text-xs">{item.unit}</td>
                      <td className="px-2 py-2 text-right text-xs">{item.rate.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right text-xs">{item.discount?.toFixed(2) || '0.00'}</td>
                      <td className="px-2 py-2 text-right font-medium text-xs">
                        {calculateTotalAmount(item.quantity, item.rate, item.discount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-4 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-medium">Items Total</p>
              <p className="text-lg font-bold">{totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Paid Today</label>
              <input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Remaining Balance</p>
              <p className="text-lg font-bold text-orange-600">{remainingBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>

            {paymentType !== 'Cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                <input
                  type="text"
                  value={paymentTransactionId}
                  onChange={(e) => setPaymentTransactionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Reference/Check number"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => closeModal(modalName)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-medium transition"
            >
              {isLoading ? 'Updating...' : 'Update Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};