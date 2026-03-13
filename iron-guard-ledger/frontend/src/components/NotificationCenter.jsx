import { useUIStore } from '../store/uiStore.js';
import { X, CheckCircle, AlertCircle, InfoIcon } from 'lucide-react';

export const NotificationCenter = () => {
  const notifications = useUIStore((state) => state.notifications);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'info':
        return <InfoIcon size={20} className="text-blue-600" />;
      default:
        return <InfoIcon size={20} className="text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor(notification.type)} animate-slide-in`}
        >
          {getIcon(notification.type)}
          <p className={`flex-1 text-sm ${getTextColor(notification.type)}`}>
            {notification.message}
          </p>
        </div>
      ))}
    </div>
  );
};