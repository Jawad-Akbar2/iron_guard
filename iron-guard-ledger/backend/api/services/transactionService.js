import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';

// Generate unique transaction ID
const generateTransactionId = async () => {
  const lastTransaction = await Transaction.findOne()
    .sort({ createdAt: -1 })
    .lean();
  
  if (!lastTransaction) return 'TXN-0001';
  
  const lastId = lastTransaction.transactionId;
  const number = parseInt(lastId.split('-')[1]) + 1;
  return `TXN-${String(number).padStart(4, '0')}`;
};

// Round to whole numbers
const roundWholeNumber = (num) => Math.round(num || 0);

export const createTransaction = async (transactionData, userId) => {
  const {
    type,
    accountType,
    accountId,
    items,
    notes = '',
    paymentType = 'Cash',
    paymentTransactionId = '',
    paidAmount = 0
  } = transactionData;

  // Validate
  if (!['sale', 'purchase', 'payment', 'return', 'adjustment'].includes(type)) {
    throw { statusCode: 400, message: 'Invalid transaction type' };
  }

  if (!accountId) {
    throw { statusCode: 400, message: 'Account required' };
  }

  // Get account details
  let account;
  let accountName;
  let customerId = null;
  let supplierId = null;

  if (accountType === 'customer') {
    account = await Customer.findById(accountId);
    if (!account) throw { statusCode: 404, message: 'Customer not found' };
    accountName = account.name;
    customerId = account.customerId;
  } else if (accountType === 'supplier') {
    account = await Supplier.findById(accountId);
    if (!account) throw { statusCode: 404, message: 'Supplier not found' };
    accountName = account.name;
    supplierId = account.supplierId;
  }

  const previousBalance = roundWholeNumber(account.currentBalance);
  let currentOrderTotal = 0;
  const processedItems = [];

  // Process items (whole numbers only)
  for (const item of items || []) {
    const itemDoc = await Item.findById(item.itemId);
    if (!itemDoc) {
      throw { statusCode: 404, message: 'Item not found' };
    }

    const quantity = roundWholeNumber(item.quantity);
    const price = roundWholeNumber(item.price);
    const itemTotal = quantity * price;
    currentOrderTotal += itemTotal;

    processedItems.push({
      itemId: item.itemId,
      itemName: itemDoc.name,
      quantity: quantity,
      unit: item.unit,
      price: price,
      total: itemTotal
    });

    // Update stock
    if (type === 'sale' || type === 'return') {
      itemDoc.currentStock -= quantity;
    } else if (type === 'purchase') {
      itemDoc.currentStock += quantity;
    }
    await itemDoc.save();
  }

  // For payment transactions, use payment amount as total
  if (type === 'payment') {
    currentOrderTotal = roundWholeNumber(paidAmount);
  }

  const paidAmountRounded = roundWholeNumber(paidAmount);
  const remainingDue = previousBalance + currentOrderTotal - paidAmountRounded;
  const finalBalance = remainingDue;
  const transactionId = await generateTransactionId();

  const transaction = new Transaction({
    transactionId,
    type,
    accountType,
    accountId,
    accountName,
    customerId,
    supplierId,
    items: processedItems,
    totalAmount: currentOrderTotal,
    previousBalance: previousBalance,
    finalBalance: finalBalance,
    notes,
    paymentType,
    paymentTransactionId,
    createdBy: userId,
    createdAt: new Date(),
    isDeleted: false
  });

  await transaction.save();

  // Update account balance and totals
  account.currentBalance = finalBalance;
  
  if (type === 'sale') {
    account.totalOrders += currentOrderTotal;
  } else if (type === 'purchase') {
    account.totalOrders += currentOrderTotal;
  } else if (type === 'payment') {
    account.totalPayments += currentOrderTotal;
  } else if (type === 'return') {
    account.totalReturns += currentOrderTotal;
  }
  
  await account.save();

  return transaction;
};

export const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .where('isDeleted').equals(false);

  if (!transaction) {
    throw { statusCode: 404, message: 'Transaction not found' };
  }
  return transaction;
};

export const getTransactionByTxnId = async (txnId) => {
  const transaction = await Transaction.findOne({ transactionId: txnId, isDeleted: false })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!transaction) {
    throw { statusCode: 404, message: 'Transaction not found' };
  }
  return transaction;
};

export const getAllTransactions = async (filters = {}) => {
  const query = { isDeleted: false };

  // Type filter
  if (filters.type) query.type = filters.type;

  // Account type filter
  if (filters.accountType) query.accountType = filters.accountType;

  // Customer filter
  if (filters.customerId) query.customerId = filters.customerId;

  // Supplier filter
  if (filters.supplierId) query.supplierId = filters.supplierId;

  // Item filter
  if (filters.itemId) query['items.itemId'] = filters.itemId;

  // Date range
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDate;
    }
  }

  // Search
  if (filters.search) {
    query.$or = [
      { transactionId: { $regex: filters.search, $options: 'i' } },
      { accountName: { $regex: filters.search, $options: 'i' } },
      { 'items.itemName': { $regex: filters.search, $options: 'i' } }
    ];
  }

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find(query)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments(query);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateTransaction = async (txnId, updates, userId) => {
  const transaction = await Transaction.findOne({ transactionId: txnId, isDeleted: false });
  if (!transaction) {
    throw { statusCode: 404, message: 'Transaction not found' };
  }

  if (updates.notes !== undefined) transaction.notes = updates.notes;
  if (updates.paymentType !== undefined) transaction.paymentType = updates.paymentType;
  if (updates.paymentTransactionId !== undefined) transaction.paymentTransactionId = updates.paymentTransactionId;

  transaction.updatedBy = userId;
  transaction.updatedAt = new Date();
  await transaction.save();

  return transaction;
};

export const softDeleteTransaction = async (txnId, userId) => {
  const transaction = await Transaction.findOne({ transactionId: txnId, isDeleted: false });
  if (!transaction) {
    throw { statusCode: 404, message: 'Transaction not found' };
  }

  // Reverse stock
  for (const item of transaction.items) {
    const itemDoc = await Item.findById(item.itemId);
    if (itemDoc) {
      if (transaction.type === 'sale' || transaction.type === 'return') {
        itemDoc.currentStock += item.quantity;
      } else if (transaction.type === 'purchase') {
        itemDoc.currentStock -= item.quantity;
      }
      await itemDoc.save();
    }
  }

  // Reverse account balance
  let account;
  if (transaction.accountType === 'customer') {
    account = await Customer.findById(transaction.accountId);
  } else {
    account = await Supplier.findById(transaction.accountId);
  }

  if (account) {
    const balanceChange = transaction.totalAmount;
    account.currentBalance -= balanceChange;
    
    if (transaction.type === 'sale') {
      account.totalOrders -= balanceChange;
    } else if (transaction.type === 'purchase') {
      account.totalOrders -= balanceChange;
    } else if (transaction.type === 'payment') {
      account.totalPayments -= balanceChange;
    } else if (transaction.type === 'return') {
      account.totalReturns -= balanceChange;
    }
    
    await account.save();
  }

  // Soft delete
  transaction.isDeleted = true;
  transaction.deletedAt = new Date();
  transaction.deletedBy = userId;
  await transaction.save();

  return { message: 'Transaction deleted successfully' };
};