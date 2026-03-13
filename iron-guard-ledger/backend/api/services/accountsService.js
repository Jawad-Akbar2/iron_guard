import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import Transaction from '../models/Transaction.js';

// Generate unique customer ID
const generateCustomerId = async () => {
  const lastCustomer = await Customer.findOne()
    .sort({ createdAt: -1 })
    .lean();
  
  if (!lastCustomer) return 'CUS-0001';
  
  const lastId = lastCustomer.customerId;
  const number = parseInt(lastId.split('-')[1]) + 1;
  return `CUS-${String(number).padStart(4, '0')}`;
};

// Generate unique supplier ID
const generateSupplierId = async () => {
  const lastSupplier = await Supplier.findOne()
    .sort({ createdAt: -1 })
    .lean();
  
  if (!lastSupplier) return 'SUP-0001';
  
  const lastId = lastSupplier.supplierId;
  const number = parseInt(lastId.split('-')[1]) + 1;
  return `SUP-${String(number).padStart(4, '0')}`;
};

// ============ CUSTOMER OPERATIONS ============

export const createCustomer = async (customerData) => {
  const { name, phone, address } = customerData;

  const existing = await Customer.findOne({ name });
  if (existing) {
    throw { statusCode: 400, message: 'Customer already exists' };
  }

  const customerId = await generateCustomerId();

  const customer = new Customer({
    customerId,
    name,
    phone: phone || '',
    address: address || '',
    currentBalance: 0,
    status: 'active',
    totalOrders: 0,
    totalPayments: 0,
    totalReturns: 0
  });

  await customer.save();
  return customer;
};

export const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw { statusCode: 404, message: 'Customer not found' };
  }
  return customer;
};

export const getAllCustomers = async (page = 1, limit = 50, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = {};

  // Search filter
  if (filters.search) {
    query.$or = [
      { customerId: { $regex: filters.search, $options: 'i' } },
      { name: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
      { address: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Balance filter
  if (filters.balanceStatus) {
    if (filters.balanceStatus === 'positive') {
      query.currentBalance = { $gt: 0 };
    } else if (filters.balanceStatus === 'negative') {
      query.currentBalance = { $lt: 0 };
    } else if (filters.balanceStatus === 'zero') {
      query.currentBalance = 0;
    }
  }

  // Date range filter
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

  const customers = await Customer.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Customer.countDocuments(query);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateCustomer = async (id, updates) => {
  const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });
  if (!customer) {
    throw { statusCode: 404, message: 'Customer not found' };
  }
  return customer;
};

export const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) {
    throw { statusCode: 404, message: 'Customer not found' };
  }
  return { message: 'Customer deleted successfully' };
};

export const getCustomerLedger = async (customerId, filters = {}) => {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw { statusCode: 404, message: 'Customer not found' };
  }

  const query = { 
    accountId: customerId, 
    accountType: 'customer',
    isDeleted: false 
  };

  // Type filter
  if (filters.transactionType) {
    query.type = filters.transactionType;
  }

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

  // Item filter
  if (filters.itemId) {
    query['items.itemId'] = filters.itemId;
  }

  // Search
  if (filters.search) {
    query.$or = [
      { transactionId: { $regex: filters.search, $options: 'i' } },
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

  // Calculate summary
  const summary = await Transaction.aggregate([
    { $match: { accountId: customer._id, accountType: 'customer', isDeleted: false } },
    {
      $group: {
        _id: null,
        totalOrders: {
          $sum: {
            $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
          }
        },
        totalPayments: {
          $sum: {
            $cond: [{ $eq: ['$type', 'payment'] }, '$totalAmount', 0]
          }
        },
        totalReturns: {
          $sum: {
            $cond: [{ $eq: ['$type', 'return'] }, Math.abs('$totalAmount'), 0]
          }
        }
      }
    }
  ]);

  return {
    customer,
    transactions,
    summary: summary[0] || { totalOrders: 0, totalPayments: 0, totalReturns: 0 },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// ============ SUPPLIER OPERATIONS ============

export const createSupplier = async (supplierData) => {
  const { name, phone, address } = supplierData;

  const existing = await Supplier.findOne({ name });
  if (existing) {
    throw { statusCode: 400, message: 'Supplier already exists' };
  }

  const supplierId = await generateSupplierId();

  const supplier = new Supplier({
    supplierId,
    name,
    phone: phone || '',
    address: address || '',
    currentBalance: 0,
    status: 'active',
    totalOrders: 0,
    totalPayments: 0,
    totalReturns: 0
  });

  await supplier.save();
  return supplier;
};

export const getSupplierById = async (id) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw { statusCode: 404, message: 'Supplier not found' };
  }
  return supplier;
};

export const getAllSuppliers = async (page = 1, limit = 50, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = {};

  // Search filter
  if (filters.search) {
    query.$or = [
      { supplierId: { $regex: filters.search, $options: 'i' } },
      { name: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
      { address: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Balance filter
  if (filters.balanceStatus) {
    if (filters.balanceStatus === 'positive') {
      query.currentBalance = { $gt: 0 };
    } else if (filters.balanceStatus === 'negative') {
      query.currentBalance = { $lt: 0 };
    } else if (filters.balanceStatus === 'zero') {
      query.currentBalance = 0;
    }
  }

  // Date range filter
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

  const suppliers = await Supplier.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Supplier.countDocuments(query);

  return {
    suppliers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateSupplier = async (id, updates) => {
  const supplier = await Supplier.findByIdAndUpdate(id, updates, { new: true });
  if (!supplier) {
    throw { statusCode: 404, message: 'Supplier not found' };
  }
  return supplier;
};

export const deleteSupplier = async (id) => {
  const supplier = await Supplier.findByIdAndDelete(id);
  if (!supplier) {
    throw { statusCode: 404, message: 'Supplier not found' };
  }
  return { message: 'Supplier deleted successfully' };
};

export const getSupplierLedger = async (supplierId, filters = {}) => {
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw { statusCode: 404, message: 'Supplier not found' };
  }

  const query = { 
    accountId: supplierId, 
    accountType: 'supplier',
    isDeleted: false 
  };

  // Type filter
  if (filters.transactionType) {
    query.type = filters.transactionType;
  }

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

  // Item filter
  if (filters.itemId) {
    query['items.itemId'] = filters.itemId;
  }

  // Search
  if (filters.search) {
    query.$or = [
      { transactionId: { $regex: filters.search, $options: 'i' } },
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

  // Calculate summary
  const summary = await Transaction.aggregate([
    { $match: { accountId: supplier._id, accountType: 'supplier', isDeleted: false } },
    {
      $group: {
        _id: null,
        totalOrders: {
          $sum: {
            $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
          }
        },
        totalPayments: {
          $sum: {
            $cond: [{ $eq: ['$type', 'payment'] }, '$totalAmount', 0]
          }
        },
        totalReturns: {
          $sum: {
            $cond: [{ $eq: ['$type', 'return'] }, Math.abs('$totalAmount'), 0]
          }
        }
      }
    }
  ]);

  return {
    supplier,
    transactions,
    summary: summary[0] || { totalOrders: 0, totalPayments: 0, totalReturns: 0 },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// ============ UNIFIED ACCOUNTS ============

export const getAllAccounts = async (filters = {}) => {
  const customerFilters = {
    search: filters.search,
    balanceStatus: filters.balanceStatus,
    startDate: filters.startDate,
    endDate: filters.endDate
  };

  const supplierFilters = {
    search: filters.search,
    balanceStatus: filters.balanceStatus,
    startDate: filters.startDate,
    endDate: filters.endDate
  };

  const page = filters.page || 1;
  const limit = filters.limit || 50;

  let accounts = [];
  let pagination = {};

  if (!filters.type || filters.type === 'customer') {
    const customerResult = await getAllCustomers(page, limit, customerFilters);
    const customersWithType = customerResult.customers.map(c => ({
      ...c.toObject(),
      accountType: 'customer'
    }));
    accounts.push(...customersWithType);
    pagination.customers = customerResult.pagination;
  }

  if (!filters.type || filters.type === 'supplier') {
    const supplierResult = await getAllSuppliers(page, limit, supplierFilters);
    const suppliersWithType = supplierResult.suppliers.map(s => ({
      ...s.toObject(),
      accountType: 'supplier'
    }));
    accounts.push(...suppliersWithType);
    pagination.suppliers = supplierResult.pagination;
  }

  // Sort by creation date
  accounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    accounts,
    pagination
  };
};