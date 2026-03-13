// Calculate total amount for a single item (whole numbers only)
export const calculateTotalAmount = (quantity, rate, discount = 0) => {
  if (quantity === null || quantity === undefined || rate === null || rate === undefined) return 0;
  const total = Math.round(quantity * rate);
  return Math.round(total - (discount || 0));
};

// Calculate remaining balance
export const calculateRemainingBalance = (previousBalance, currentOrderTotal, paidAmount) => {
  const previous = Math.round(previousBalance || 0);
  const current = Math.round(currentOrderTotal || 0);
  const paid = Math.round(paidAmount || 0);
  return previous + current - paid;
};

// Calculate profit for single item
export const calculateProfit = (saleRate, purchaseRate = 0, quantity) => {
  if (quantity === null || quantity === undefined) return 0;
  return Math.round((saleRate - (purchaseRate || 0)) * quantity);
};

// Calculate total with multiple items
export const calculateMultiItemTotal = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => {
    const itemTotal = calculateTotalAmount(item.quantity, item.price, item.discount);
    return sum + itemTotal;
  }, 0);
};

// Calculate profit for multiple items
export const calculateMultiItemProfit = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => {
    const profit = calculateProfit(item.price, item.purchaseRate || 0, item.quantity);
    return sum + profit;
  }, 0);
};

// Format number with commas (NO DECIMALS)
export const formatNumberWithCommas = (num) => {
  if (num === null || num === undefined) return '0';
  const n = Math.round(num);
  return n.toLocaleString('en-US');
};

// Format currency with commas (NO DECIMALS)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0';
  const num = Math.round(amount);
  return num.toLocaleString('en-US');
};

// Validate transaction data
export const validateTransaction = (transaction) => {
  const errors = [];

  if (!transaction.type) errors.push('Transaction type is required');
  if (!transaction.accountId) errors.push('Account is required');
  if (!transaction.items || transaction.items.length === 0) {
    errors.push('At least one item is required');
  }

  transaction.items?.forEach((item, idx) => {
    if (!item.itemId) errors.push(`Item ${idx + 1}: Item is required`);
    if (!item.quantity || item.quantity === 0) errors.push(`Item ${idx + 1}: Quantity is required`);
    if (!item.price || item.price < 0) errors.push(`Item ${idx + 1}: Price must be greater than 0`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check stock availability
export const checkStockWarning = (item, requestedQty) => {
  if (requestedQty > item.currentStock) {
    return {
      hasWarning: true,
      message: `Only ${item.currentStock} available, requested ${requestedQty}`,
      available: item.currentStock,
      requested: requestedQty
    };
  }
  return { hasWarning: false };
};