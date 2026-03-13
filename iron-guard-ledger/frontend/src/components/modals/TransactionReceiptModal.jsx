import { useQuery } from '@tanstack/react-query';
import { transactionAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { X, Edit2, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime, formatCurrency } from '../../utils/dateFormatter.js';
import { useModalManager } from '../../hooks/useModalManager.js';

export const TransactionReceiptModal = ({ data }) => {
  const { closeModal, openModal } = useUIStore();
  const { closeModal: closeOnEsc } = useModalManager('transactionReceipt');

  const { data: receiptData, isLoading } = useQuery({
    queryKey: ['receipt', data?.txnId],
    queryFn: () => transactionAPI.getReceipt(data?.txnId),
    enabled: !!data?.txnId
  });

  const txn = receiptData?.data;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">Loading receipt...</div>
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">Receipt not found</div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
    toast.success('Printing receipt...');
  };

  const handleEdit = () => {
    closeModal('transactionReceipt');
    openModal('editTransaction', { transactionId: txn._id, txnId: txn.transactionId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-h-[90vh] max-w-2xl flex flex-col">
        {/* FIXED HEADER */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 flex justify-between items-center border-b border-blue-900">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Receipt</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">{txn.transactionId}</p>
          </div>
          <button
            onClick={() => closeModal('transactionReceipt')}
            className="hover:bg-blue-700 p-2 rounded transition flex-shrink-0"
            title="Close (ESC)"
          >
            <X size={24} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <h3 className="text-center font-bold text-lg text-gray-900 mb-4">IRONGUARD LEDGER</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Transaction ID</p>
                <p className="font-mono font-bold text-gray-900">{txn.transactionId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-bold text-gray-900">{formatDateTime(txn.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Type</p>
                <p className="font-bold text-gray-900 capitalize">{txn.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className="font-bold text-green-600">Completed</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Account Name</p>
                <p className="font-bold text-gray-900">{txn.accountName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Account Type</p>
                <p className="font-bold text-gray-900 capitalize">{txn.accountType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600">Account ID</p>
                <p className="font-mono font-bold text-gray-900">{txn.customerId || txn.supplierId || '-'}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {txn.items && txn.items.length > 0 && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <h4 className="font-semibold text-gray-900 p-4 bg-gray-100 text-sm">Items</h4>
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left border-r border-gray-300">Item</th>
                    <th className="px-4 py-2 text-right border-r border-gray-300">Qty</th>
                    <th className="px-4 py-2 text-left border-r border-gray-300">Unit</th>
                    <th className="px-4 py-2 text-right border-r border-gray-300">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {txn.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-left border-r border-gray-300">{item.itemName}</td>
                      <td className="px-4 py-2 text-right border-r border-gray-300">{item.quantity}</td>
                      <td className="px-4 py-2 text-left border-r border-gray-300">{item.unit}</td>
                      <td className="px-4 py-2 text-right border-r border-gray-300">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Financial Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="text-gray-700">Previous Balance:</span>
                <span className={`font-bold ${txn.previousBalance > 0 ? 'text-red-600' : txn.previousBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {formatCurrency(txn.previousBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="text-gray-700">Transaction Amount:</span>
                <span className="font-bold text-gray-900">{formatCurrency(txn.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-green-300">
                <span className="text-gray-700 font-semibold">Final Balance:</span>
                <span className={`font-bold text-lg ${txn.finalBalance > 0 ? 'text-red-600' : txn.finalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {formatCurrency(txn.finalBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Payment Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600">Payment Type</p>
                <p className="font-bold text-gray-900">{txn.paymentType}</p>
              </div>
              {txn.paymentTransactionId && (
                <div>
                  <p className="text-xs text-gray-600">Payment Reference</p>
                  <p className="font-mono font-bold text-gray-900">{txn.paymentTransactionId}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">Created By</p>
                <p className="font-bold text-gray-900">{txn.createdBy?.name || 'System'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Created At</p>
                <p className="font-bold text-gray-900">{formatDateTime(txn.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {txn.notes && (
            <div className="border border-gray-300 rounded-lg p-4 bg-yellow-50">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Notes</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{txn.notes}</p>
            </div>
          )}
        </div>

        {/* FIXED FOOTER */}
        <div className="flex-shrink-0 bg-gray-100 border-t border-gray-300 p-3 sm:p-4 flex gap-2">
          <button
            onClick={() => closeModal('transactionReceipt')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white font-semibold text-sm transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <Edit2 size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};