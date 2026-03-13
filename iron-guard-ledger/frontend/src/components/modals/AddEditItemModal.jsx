import { useState, useEffect } from 'react';
import { itemAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddEditItemModal = ({ modalName, data, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: 'piece',
    customUnit: '',
    purchaseRate: 0,
    saleRate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUIStore();

  const units = ['kg', 'ton', 'liter', 'piece', 'meter', 'box', 'pack'];

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        unit: units.includes(data.unit) ? data.unit : 'custom',
        customUnit: units.includes(data.unit) ? '' : data.unit,
        purchaseRate: data.purchaseRate || 0,
        saleRate: data.saleRate || 0
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const finalUnit = formData.unit === 'custom' ? formData.customUnit : formData.unit;

    setIsLoading(true);
    try {
      if (data?._id) {
        await itemAPI.updateItem(data._id, { ...formData, unit: finalUnit });
        toast.success('Item updated');
      } else {
        await itemAPI.createItem({ ...formData, unit: finalUnit });
        toast.success('Item added');
      }
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">{data ? 'Edit Item' : 'Add Item'}</h2>
          <button
            onClick={() => closeModal(modalName)}
            className="hover:bg-blue-700 p-2 rounded"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Item name"
            />
          </div>

          {/* Unit with Custom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>

            {formData.unit !== 'custom' ? (
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value, customUnit: '' })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, customUnit: e.target.value })
                  }
                  placeholder="Type unit"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, unit: '', customUnit: '' })
                  }
                  className="text-red-500 hover:bg-red-50 px-3 rounded"
                  title="Clear"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Purchase Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Rate</label>
            <input
              type="number"
              step="0.01"
              value={formData.purchaseRate}
              onChange={(e) => setFormData({ ...formData, purchaseRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Sale Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Rate</label>
            <input
              type="number"
              step="0.01"
              value={formData.saleRate}
              onChange={(e) => setFormData({ ...formData, saleRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Footer */}
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};