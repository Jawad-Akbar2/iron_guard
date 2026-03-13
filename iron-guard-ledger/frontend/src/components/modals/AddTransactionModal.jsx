import { useState, useEffect, useCallback } from 'react';
import { transactionAPI, accountsAPI, itemAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateTotalAmount, calculateMultiItemTotal, calculateRemainingBalance, formatCurrency } from '../../utils/calculator.js';
import { useModalManager } from '../../hooks/useModalManager.js';
import { AddCustomerQuickCreateModal } from './AddCustomerQuickCreateModal.jsx';
import { AddSupplierQuickCreateModal } from './AddSupplierQuickCreateModal.jsx';

export const AddTransactionModal = ({ modalName, onSuccess }) => {
  const [transactionType, setTransactionType] = useState('sale');
  const [accountType, setAccountType] = useState('customer');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [paymentType, setPaymentType] = useState('Cash');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { itemId: '', itemName: '', quantity: 1, unit: '', customUnit: '', price: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const { closeModal, openModal } = useUIStore();
  const queryClient = useQueryClient();
  const { closeModal: closeOnEsc } = useModalManager(modalName);

  // Fetch data
  const { data: accountsData, refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts-all'],
    queryFn: () => accountsAPI.getAllAccounts({ limit: 1000 })
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items-all'],
    queryFn: () => itemAPI.getAllItems(1, 1000)
  });

  const customers = accountsData?.data?.accounts?.filter(a => a.accountType === 'customer') || [];
  const suppliers = accountsData?.data?.accounts?.filter(a => a.accountType === 'supplier') || [];
  const allItems = itemsData?.data?.items || [];

  const accounts = accountType === 'customer' ? customers : suppliers;
  const predefinedUnits = ['ton', 'kg', 'bag', 'liter', 'piece', 'meter', 'box', 'pack', 'carton', 'roll', 'bundle'];

  // Auto-select newly created account
  const handleQuickCreateSuccess = useCallback((newAccountId) => {
    refetchAccounts();
    setTimeout(() => {
      setSelectedAccount(newAccountId);
      setShowQuickCreate(false);
    }, 500);
  }, [refetchAccounts]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'quantity') {
      newItems[index][field] = Math.round(value) || 0;
    } else if (field === 'price') {
      newItems[index][field] = Math.round(value) || 0;
    } else if (field === 'unit') {
      newItems[index][field] = value;
      if (value !== 'custom') newItems[index].customUnit = '';
    } else if (field === 'customUnit') {
      newItems[index].customUnit = value;
      newItems[index].unit = value;
    } else {
      newItems[index][field] = value;
    }

    if (field === 'itemId') {
      const item = allItems.find(i => i._id === value);
      if (item) {
        newItems[index].itemName = item.name;
        newItems[index].unit = item.unit;
        newItems[index].customUnit = '';
        newItems[index].price = transactionType === 'purchase' ? item.purchaseRate : item.saleRate;
      }
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { itemId: '', itemName: '', quantity: 1, unit: '', customUnit: '', price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length === 0 ? [{ itemId: '', itemName: '', quantity: 1, unit: '', customUnit: '', price: 0 }] : newItems);
  };

  // Calculations
  const currentOrderTotal = calculateMultiItemTotal(items);
  const selectedAcc = accounts.find(a => a._id === selectedAccount);
  const previousBalance = Math.round(selectedAcc?.currentBalance || 0);
  const paidAmountRounded = Math.round(paidAmount);
  const remainingDue = calculateRemainingBalance(previousBalance, currentOrderTotal, paidAmountRounded);
  const finalBalance = remainingDue;

  const isValidTransaction = selectedAccount && items.length > 0 && items.every(i => i.itemId && i.quantity > 0 && i.price >= 0);
  const isOverpayment = paidAmountRounded > (previousBalance + currentOrderTotal);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidTransaction) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      const transactionData = {
        type: transactionType,
        accountType: accountType,
        accountId: selectedAccount,
        items: items.map(item => ({
          itemId: item.itemId,
          quantity: Math.round(item.quantity),
          unit: item.unit || item.customUnit,
          price: Math.round(item.price)
        })),
        notes: notes.trim(),
        paymentType: paymentType,
        paymentTransactionId: paymentTransactionId.trim() || '',
        paidAmount: paidAmountRounded
      };

      await transactionAPI.createTransaction(transactionData);
      
      // Invalidate related queries for real-time updates
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
      await queryClient.invalidateQueries({ queryKey: ['account-ledger'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Transaction created successfully');
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 sm:p-6 flex justify-between items-start sm:items-center z-20 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">Add Transaction</h2>
              {selectedAcc && (
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  {selectedAcc.name} • {selectedAcc.accountType === 'customer' ? selectedAcc.customerId : selectedAcc.supplierId}
                </p>
              )}
            </div>
            <button
              onClick={() => closeModal(modalName)}
              className="hover:bg-blue-700 p-2 rounded transition flex-shrink-0"
              title="Close (ESC)"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Account Summary */}
              {selectedAcc && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    <div className="bg-white rounded p-2 sm:p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium">Account Name</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{selectedAcc.name}</p>
                    </div>
                    <div className="bg-white rounded p-2 sm:p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium">Account ID</p>
                      <p className="text-xs sm:text-sm font-mono font-bold text-gray-900">
                        {selectedAcc.accountType === 'customer' ? selectedAcc.customerId : selectedAcc.supplierId}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 sm:p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium">Phone</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{selectedAcc.phone || '-'}</p>
                    </div>
                    <div className="bg-white rounded p-2 sm:p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 font-medium">Account Type</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 capitalize">{accountType}</p>
                    </div>
                    <div className={`bg-white rounded p-2 sm:p-3 border-2 ${previousBalance > 0 ? 'border-red-400' : previousBalance < 0 ? 'border-green-400' : 'border-gray-300'}`}>
                      <p className="text-xs text-gray-600 font-medium">Previous Balance</p>
                      <p className={`text-sm sm:text-base font-bold ${previousBalance > 0 ? 'text-red-600' : previousBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatCurrency(previousBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Type & Account Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Transaction Type *</label>
                  <select
                    value={transactionType}
                    onChange={(e) => {
                      setTransactionType(e.target.value);
                      if (e.target.value === 'purchase') {
                        setAccountType('supplier');
                        setSelectedAccount('');
                      } else if (['sale', 'payment', 'return'].includes(e.target.value)) {
                        setAccountType('customer');
                        setSelectedAccount('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="sale">Sale</option>
                    <option value="purchase">Purchase</option>
                    <option value="payment">Payment</option>
                    <option value="return">Return</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Account Type *</label>
                  <select
                    value={accountType}
                    onChange={(e) => {
                      setAccountType(e.target.value);
                      setSelectedAccount('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    disabled={transactionType === 'purchase'}
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>

              {/* Account Selection with Quick Create */}
              <div>
  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
    Select {accountType === 'customer' ? 'Customer' : 'Supplier'} *
  </label>
  <select
    value={selectedAccount}
    onChange={(e) => {
      if (e.target.value === 'new') {
        // Open Quick Create Modal
        setShowQuickCreate(true); 
        setSelectedAccount(''); // Reset selection
      } else {
        setSelectedAccount(e.target.value);
      }
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
    required
  >
    <option value="">Choose account...</option>

    {/* + New option */}
    <option value="new" className="text-blue-600 font-semibold">+ New</option>

    {/* Existing accounts */}
    {accounts.map(account => (
      <option key={account._id} value={account._id}>
        {account.name} ({accountType === 'customer' ? account.customerId : account.supplierId}) - Bal: {formatCurrency(account.currentBalance)}
      </option>
    ))}
  </select>
</div>

              {/* Items Table */}
              {selectedAccount && (
                <>
                  <div className="flex justify-between items-center mt-6 mb-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700">Items *</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition text-xs sm:text-sm"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead className="bg-gray-200 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left border border-gray-300 font-semibold">Item Name</th>
                          <th className="px-2 py-2 text-right border border-gray-300 font-semibold">Qty</th>
                          <th className="px-2 py-2 text-left border border-gray-300 font-semibold min-w-[100px]">Unit</th>
                          <th className="px-2 py-2 text-right border border-gray-300 font-semibold">Price</th>
                          <th className="px-2 py-2 text-right border border-gray-300 font-semibold">Total</th>
                          <th className="px-2 py-2 text-center border border-gray-300 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-2 py-2 border border-gray-300">
                              <select
                                value={item.itemId}
                                onChange={(e) => handleItemChange(idx, 'itemId', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                required
                              >
                                <option value="">Select...</option>
                                {allItems.map(i => (
                                  <option key={i._id} value={i._id}>{i.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2 border border-gray-300">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none"
                                required
                              />
                            </td>
                            <td className="px-2 py-2 border border-gray-300">
                              {item.unit !== 'custom' ? (
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                  <option value="">Unit</option>
                                  {predefinedUnits.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                  <option value="custom">Custom...</option>
                                </select>
                              ) : (
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    value={item.customUnit}
                                    onChange={(e) => handleItemChange(idx, 'customUnit', e.target.value)}
                                    placeholder="Type unit"
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleItemChange(idx, 'unit', '')}
                                    className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
                                    title="Clear"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2 border border-gray-300">
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none"
                                required
                              />
                            </td>
                            <td className="px-2 py-2 border border-gray-300 text-right font-semibold text-blue-600">
                              {formatCurrency(calculateTotalAmount(item.quantity, item.price, 0))}
                            </td>
                            <td className="px-2 py-2 border border-gray-300 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Summary Section */}
              {selectedAccount && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-3 sm:p-4 mt-6">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Balance Summary</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    <div className="bg-white rounded p-2 sm:p-3 border border-gray-300">
                      <p className="text-xs text-gray-600">Previous Balance</p>
                      <p className={`text-sm sm:text-base font-bold ${previousBalance > 0 ? 'text-red-600' : previousBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatCurrency(previousBalance)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2 sm:p-3 border border-gray-300">
                      <p className="text-xs text-gray-600">Current Order</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">{formatCurrency(currentOrderTotal)}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2 sm:p-3 border-2 border-blue-300">
                      <label className="text-xs text-gray-700 font-semibold block mb-1">Paid Today</label>
                      <input
                        type="number"
                        min="0"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Math.round(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className={`rounded p-2 sm:p-3 border-2 ${remainingDue < 0 ? 'bg-green-50 border-green-400' : remainingDue > 0 ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-300'}`}>
                      <p className="text-xs text-gray-600">Remaining Due</p>
                      <p className={`text-sm sm:text-base font-bold ${remainingDue < 0 ? 'text-green-600' : remainingDue > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {formatCurrency(remainingDue)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded p-2 sm:p-3 border-2 border-green-400">
                      <p className="text-xs text-green-700 font-semibold">Final Balance</p>
                      <p className={`text-sm sm:text-base font-bold ${finalBalance > 0 ? 'text-red-600' : finalBalance < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatCurrency(finalBalance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overpayment Warning */}
              {isOverpayment && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex gap-2">
                  <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    <strong>Warning:</strong> Paid Today exceeds total. Customer will have credit balance.
                  </p>
                </div>
              )}

              {/* Payment Section */}
              {selectedAccount && (
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 sm:p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-700">Payment Details</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 block">Payment Type *</label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    {paymentType !== 'Cash' && (
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 block">Payment ID</label>
                        <input
                          type="text"
                          value={paymentTransactionId}
                          onChange={(e) => setPaymentTransactionId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="Reference number"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Transaction notes (optional)..."
                      rows="2"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-300 p-3 sm:p-4 flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => closeModal(modalName)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white font-semibold transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValidTransaction}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition text-sm"
            >
              {isLoading ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Create Modals */}
      {showQuickCreate && accountType === 'customer' && (
        <AddCustomerQuickCreateModal
          onSuccess={handleQuickCreateSuccess}
          onCancel={() => setShowQuickCreate(false)}
        />
      )}
      {showQuickCreate && accountType === 'supplier' && (
        <AddSupplierQuickCreateModal
          onSuccess={handleQuickCreateSuccess}
          onCancel={() => setShowQuickCreate(false)}
        />
      )}
    </>
  );
};