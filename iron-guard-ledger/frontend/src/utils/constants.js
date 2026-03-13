// Transaction Types
export const TRANSACTION_TYPES = {
  SALE: 'sale',
  PURCHASE: 'purchase',
  RETURN: 'return',
  PAYMENT: 'payment'
};

// Entity Types
export const ENTITY_TYPES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier'
};

// Payment Types
export const PAYMENT_TYPES = {
  CASH: 'Cash',
  BANK: 'Bank',
  EASYPAISAL: 'EasyPaisa'
};

// Units
export const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ton', label: 'Ton' },
  { value: 'liter', label: 'Liter' },
  { value: 'piece', label: 'Piece' },
  { value: 'meter', label: 'Meter' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' }
];

// User Roles
export const USER_ROLES = {
  OWNER: 'Owner',
  MANAGER: 'Manager'
};

// Date Range Periods
export const DATE_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom'
};

// Status Colors
export const STATUS_COLORS = {
  sale: 'bg-blue-100 text-blue-800',
  purchase: 'bg-orange-100 text-orange-800',
  return: 'bg-red-100 text-red-800',
  payment: 'bg-green-100 text-green-800'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZES = [10, 25, 50, 100];

// Debounce delay (ms)
export const DEBOUNCE_DELAY = 300;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REGISTER: '/users/register',
    ME: '/users/me'
  },
  USERS: '/users',
  ITEMS: '/items',
  CUSTOMERS: '/customers',
  SUPPLIERS: '/suppliers',
  TRANSACTIONS: '/transactions',
  REPORTS: '/reports'
};