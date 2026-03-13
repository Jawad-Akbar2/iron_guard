import { useState, useEffect } from 'react';
import { accountsAPI } from '../../services/api.js';
import { useUIStore } from '../../store/uiStore.js';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export const AddEditCustomerModal = ({ modalName, data, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { closeModal } = useUIStore();

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        phone: data.phone || '',
        address: data.address || ''
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (data?._id) {
        // Edit customer
        await accountsAPI.updateCustomer(data._id, formData);
        toast.success('Customer updated');
      } else {
        // Create customer
        await accountsAPI.createCustomer(formData);
        toast.success('Customer created');
      }
      closeModal(modalName);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">{data ? 'Edit Customer' : 'Add Customer'}</h2>
          <button
            onClick={() => closeModal(modalName)}
            className="hover:bg-blue-700 p-2 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Address"
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