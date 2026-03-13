import { useState } from 'react';
import { transactionAPI, accountsAPI, itemAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateTotalAmount, formatCurrency } from '../../utils/calculator.js';
import { useModalManager } from '../../hooks/useModalManager.js';

export const AddReturnModal = ({ modalName, onSuccess }) => {
  const [accountType, setAccountType] = useState('customer');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [items, setItems] = useState([
    { itemId: '', itemName: '', quantity: -1, unit: '', customUnit: '', price: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUIStore();
  const queryClient = useQueryClient();
  const { closeModal: closeOnEsc } = useModalManager(modalName);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-all'],
    queryFn: () => accountsAPI.getAllAccounts({ limit: 1000 })
  });

  const { data: itemsData } = useQuery({
    queryKey: ['items-all'],
    queryFn: () => itemAPI.getAllItems(1, 1000)
  });

  const accounts = accountsData?.data?.accounts?.filter(a => a.accountType === accountType) || [];
  const allItems = itemsData?.data?.items || [];
  const predefinedUnits = ['ton', 'kg', 'bag', 'liter', 'piece', 'meter', 'box', 'pack', 'carton', 'roll'];

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'quantity') {
      newItems[index][field] = Math.round(value) || -1;
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
        newItems[index].price = item.saleRate;
      }
    }

    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { itemId: '', itemName: '', quantity: -1, unit: '', customUnit: '', price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length === 0 ? [{ itemId: '', itemName: '', quantity: -1, unit: '', customUnit: '', price: 0 }] : newItems);
  };

  const totalAmount = items.reduce((sum, item) => {
    return sum + calculateTotalAmount(Math.abs(item.quantity), item.price, 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }

    if (items.length === 0 || items.some(i => !i.itemId || i.quantity === 0)) {
      toast.error('Please add valid items with quantities');
      return;
    }

    setIsLoading(true);
    try {
      await transactionAPI.createTransaction({
        type: 'return',
        accountType: accountType,
        accountId: selectedAccount,
        items: items.map(item => ({
          itemId: item.itemId,
          quantity: Math.round(item.quantity),
          unit: item.unit || item.customUnit,
          price: Math.round(item.price)
        })),
        notes: notes.trim(),
        paymentType: 'Cash',
        paidAmount: 0
      });

      // Invalidate queries for real-time updates
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['accounts-all'] });
      await queryClient.invalidateQueries({ queryKey: ['account-ledger'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });

      toast.success('Return recorded successfully');
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to record return');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[95vh]">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-800 text-white p-4 sm:p-6 flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold">Add Return / Adjustment</h2>
          <button
            onClick={() => closeModal(modalName)}
            className="hover:bg-red-700 p-2 rounded transition flex-shrink-0"
            title="Close (ESC)"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Account Type *</label>
                <select
                  value={accountType}
                  onChange={(e) => {
                    setAccountType(e.target.value);
                    setSelectedAccount('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Select {accountType === 'customer' ? 'Customer' : 'Supplier'} *
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  required
                >
                  <option value="">Choose...</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({accountType === 'customer' ? account.customerId : account.supplierId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedAccount && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700">Items (Negative Qty) *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 transition text-xs sm:text-sm"
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
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-red-500 outline-none"
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
                              max="-1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right focus:ring-1 focus:ring-red-500 outline-none"
                              required
                            />
                          </td>
                          <td className="px-2 py-2 border border-gray-300">
                            {item.unit !== 'custom' ? (
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-red-500 outline-none"
                              >
                                <option value="">Unit</option>
                                {predefinedUnits.map(u => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                                <option value="custom">Custom...</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={item.customUnit}
                                onChange={(e) => handleItemChange(idx, 'customUnit', e.target.value)}
                                placeholder="Type unit"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-red-500 outline-none"
                                required
                              />
                            )}
                          </td>
                          <td className="px-2 py-2 border border-gray-300">
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right focus:ring-1 focus:ring-red-500 outline-none"
                              required
                            />
                          </td>
                          <td className="px-2 py-2 border border-gray-300 text-right font-semibold text-red-600">
                            -{formatCurrency(calculateTotalAmount(Math.abs(item.quantity), item.price, 0))}
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

                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 sm:p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Return Summary</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-white rounded p-2 border border-red-200">
                      <p className="text-xs text-gray-600">Return Amount</p>
                      <p className="text-sm sm:text-base font-bold text-red-600">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-red-200">
                      <p className="text-xs text-gray-600">Net Adjustment</p>
                      <p className="text-sm sm:text-base font-bold text-red-600">-{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-300 col-span-2 sm:col-span-1">
                      <p className="text-xs text-gray-600">Items Count</p>
                      <p className="text-sm sm:text-base font-bold text-gray-900">{items.length}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    placeholder="Return notes (optional)..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </form>
        </div>

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
            disabled={isLoading || !selectedAccount}
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 font-semibold transition text-sm"
          >
            {isLoading ? 'Recording...' : 'Record Return'}
          </button>
        </div>
      </div>
    </div>
  );
};