import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ============ USER API ============
export const userAPI = {
  register: (data) => apiClient.post('/users/register', data),
  login: (data) => apiClient.post('/users/login', data),
  logout: () => apiClient.post('/users/logout'),
  getMe: () => apiClient.get('/users/me'),
  getAllUsers: () => apiClient.get('/users'),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`)
};

// ============ ITEM API ============
export const itemAPI = {
  createItem: (data) => apiClient.post('/items', data),
  getAllItems: (page = 1, limit = 50) => 
    apiClient.get('/items', { params: { page, limit } }),
  getItemById: (id) => apiClient.get(`/items/${id}`),
  updateItem: (id, data) => apiClient.put(`/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/items/${id}`)
};

// ============ ACCOUNTS API ============
export const accountsAPI = {
  getAllAccounts: (filters = {}) => 
    apiClient.get('/accounts', { params: filters }),
  
  // Customer operations
  createCustomer: (data) => apiClient.post('/accounts/customers', data),
  getCustomer: (id) => apiClient.get(`/accounts/customers/${id}`),
  updateCustomer: (id, data) => apiClient.put(`/accounts/customers/${id}`, data),
  deleteCustomer: (id) => apiClient.delete(`/accounts/customers/${id}`),
  
  // Supplier operations
  createSupplier: (data) => apiClient.post('/accounts/suppliers', data),
  getSupplier: (id) => apiClient.get(`/accounts/suppliers/${id}`),
  updateSupplier: (id, data) => apiClient.put(`/accounts/suppliers/${id}`, data),
  deleteSupplier: (id) => apiClient.delete(`/accounts/suppliers/${id}`),
  
  // Ledger operations
  getAccountLedger: (accountType, id, filters = {}) => 
    apiClient.get(`/accounts/${accountType}/${id}/ledger`, { params: filters })
};

// ============ TRANSACTION API ============
export const transactionAPI = {
  createTransaction: (data) => apiClient.post('/transactions', data),
  getAllTransactions: (filters = {}) => 
    apiClient.get('/transactions', { params: filters }),
  getTransactionById: (id) => apiClient.get(`/transactions/${id}`),
  getTransactionByTxnId: (txnId) => apiClient.get(`/transactions/txn/${txnId}`),
  getReceipt: (txnId) => apiClient.get(`/transactions/receipt/${txnId}`),
  updateTransaction: (txnId, data) => apiClient.put(`/transactions/${txnId}`, data),
  softDeleteTransaction: (txnId) => apiClient.delete(`/transactions/${txnId}`)
};

// ============ REPORT API ============
export const reportAPI = {
  getAggregatedReports: (filters = {}) => 
    apiClient.get('/reports/aggregated', { params: filters }),
  getDailyReport: (filters = {}) => 
    apiClient.get('/reports/daily', { params: filters }),
  getMonthlyReport: (filters = {}) => 
    apiClient.get('/reports/monthly', { params: filters }),
  getDashboardKPIs: (filters = {}) => 
    apiClient.get('/reports/dashboard-kpis', { params: filters })
};

export default apiClient;