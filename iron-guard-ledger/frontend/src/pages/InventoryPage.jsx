import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatCurrency } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const InventoryPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { openModal } = useUIStore();

  const { data: itemsData, isLoading, refetch } = useQuery({
    queryKey: ['items', page],
    queryFn: () => itemAPI.getAllItems(page, 50),
    staleTime: 5 * 60 * 1000
  });

  const items = itemsData?.data?.items || [];
  const pagination = itemsData?.data?.pagination || {};

  const handleAddItem = () => {
    openModal('addItem');
  };

  const handleEditItem = (item) => {
    openModal('editItem', item);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await itemAPI.deleteItem(id);
        toast.success('Item deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={6} />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Current Stock</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Purchase Rate</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Sale Rate</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item._id} className={`hover:bg-gray-50 ${item.currentStock < 0 ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${item.currentStock < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.currentStock}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(item.purchaseRate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(item.saleRate)}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-green-600 hover:bg-green-50 p-2 rounded"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t">
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
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