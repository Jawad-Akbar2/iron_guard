import { format, parse, isValid } from 'date-fns';

// Format date to DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd/MM/yyyy');
  } catch {
    return '';
  }
};

// Format time to HH:mm (24-hour)
export const formatTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'HH:mm');
  } catch {
    return '';
  }
};

// Format date and time together DD/MM/YYYY HH:mm
export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  } catch {
    return '';
  }
};

// Parse DD/MM/YYYY back to Date
export const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    return parse(dateString, 'dd/MM/yyyy', new Date());
  } catch {
    return null;
  }
};

// Parse DD/MM/YYYY HH:mm back to Date
export const parseDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  try {
    return parse(dateTimeString, 'dd/MM/yyyy HH:mm', new Date());
  } catch {
    return null;
  }
};

// Format currency with commas (NO DECIMALS)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0';
  const num = Math.round(amount);
  return num.toLocaleString('en-US');
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const n = Math.round(num);
  return n.toLocaleString('en-US');
};

// Format large numbers with K, M, B suffix
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const n = Math.round(num);

  if (n >= 1000000000) return Math.round(n / 1000000000) + 'B';
  if (n >= 1000000) return Math.round(n / 1000000) + 'M';
  if (n >= 1000) return Math.round(n / 1000) + 'K';
  return n.toString();
};

// Get relative time
export const getRelativeTime = (date) => {
  if (!date) return '';
  try {
    const now = new Date();
    const dateObj = new Date(date);
    const diff = now - dateObj;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return formatDate(date);
  } catch {
    return '';
  }
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return start && end ? `${start} - ${end}` : '';
};

// Get date range for common periods
export const getDateRange = (period) => {
  const today = new Date();
  const endDate = today;
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};