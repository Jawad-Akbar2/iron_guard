import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { useUIStore } from '../store/uiStore.js';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Accounts', path: '/accounts', icon: '👥' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Transactions', path: '/transactions', icon: '💳' },
    { label: 'Payments', path: '/payments', icon: '💰' },
    { label: 'Returns', path: '/returns', icon: '↩️' },
    { label: 'Reports', path: '/reports', icon: '📈' },
    { label: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">IronGuard</h1>
          <p className="text-xs text-gray-400 mt-1">Ledger System</p>
        </div>

        <nav className="mt-8 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-6">
            {/* Quick Add Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                + Quick Add
                <ChevronDown size={16} />
              </button>

              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <Link
                    to="/accounts"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b"
                  >
                    Add Customer
                  </Link>
                  <Link
                    to="/accounts"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b"
                  >
                    Add Supplier
                  </Link>
                  <Link
                    to="/inventory"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b"
                  >
                    Add Item
                  </Link>
                  <Link
                    to="/transactions"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b"
                  >
                    Add Transaction
                  </Link>
                  <Link
                    to="/payments"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 border-b"
                  >
                    Record Payment
                  </Link>
                  <Link
                    to="/returns"
                    onClick={() => setShowAddMenu(false)}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Add Return
                  </Link>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};