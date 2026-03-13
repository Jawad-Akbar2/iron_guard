import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api.js';
import { useUIStore } from '../store/uiStore.js';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { formatDateTime } from '../utils/dateFormatter.js';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const SettingsUsersPage = () => {
  const { openModal } = useUIStore();

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => userAPI.getAllUsers(),
    staleTime: 5 * 60 * 1000
  });

  const users = usersData?.data || [];

  const handleAddUser = () => {
    openModal('addUser');
  };

  const handleEditUser = (user) => {
    openModal('editUser', user);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user? This cannot be undone.')) {
      try {
        await userAPI.deleteUser(id);
        toast.success('User deleted');
        refetch();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <SkeletonLoader rows={5} columns={5} />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Login</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                      user.role === 'Owner' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-green-600 hover:bg-green-50 p-2 rounded"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
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
        )}
      </div>
    </div>
  );
};