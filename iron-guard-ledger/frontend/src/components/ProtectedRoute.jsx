import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};