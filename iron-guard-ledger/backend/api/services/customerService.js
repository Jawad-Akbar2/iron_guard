// import Customer from '../models/Customer.js';
// import Transaction from '../models/Transaction.js';

// // Generate unique customer ID
// const generateCustomerId = async () => {
//   const lastCustomer = await Customer.findOne()
//     .sort({ createdAt: -1 })
//     .lean();
  
//   if (!lastCustomer) return 'CUS-0001';
  
//   const lastId = lastCustomer.customerId;
//   const number = parseInt(lastId.split('-')[1]) + 1;
//   return `CUS-${String(number).padStart(4, '0')}`;
// };

// export const createCustomer = async (customerData) => {
//   const { name, phone, address } = customerData;

//   const existing = await Customer.findOne({ name });
//   if (existing) {
//     throw { statusCode: 400, message: 'Customer already exists' };
//   }

//   const customerId = await generateCustomerId();

//   const customer = new Customer({
//     customerId,
//     name,
//     phone: phone || '',
//     address: address || '',
//     currentBalance: 0,
//     status: 'active',
//     totalOrders: 0,
//     totalPayments: 0,
//     totalReturns: 0
//   });

//   await customer.save();
//   return customer;
// };

// export const getCustomerById = async (id) => {
//   const customer = await Customer.findById(id);
//   if (!customer) {
//     throw { statusCode: 404, message: 'Customer not found' };
//   }
//   return customer;
// };

// export const getCustomerByCustomerId = async (customerId) => {
//   const customer = await Customer.findOne({ customerId });
//   if (!customer) {
//     throw { statusCode: 404, message: 'Customer not found' };
//   }
//   return customer;
// };

// export const getAllCustomers = async (page = 1, limit = 50, filters = {}) => {
//   const skip = (page - 1) * limit;
//   const query = {};

//   // Search filter
//   if (filters.search) {
//     query.$or = [
//       { customerId: { $regex: filters.search, $options: 'i' } },
//       { name: { $regex: filters.search, $options: 'i' } },
//       { phone: { $regex: filters.search, $options: 'i' } },
//       { address: { $regex: filters.search, $options: 'i' } }
//     ];
//   }

//   // Balance filter
//   if (filters.balanceStatus) {
//     if (filters.balanceStatus === 'positive') {
//       query.currentBalance = { $gt: 0 };
//     } else if (filters.balanceStatus === 'negative') {
//       query.currentBalance = { $lt: 0 };
//     } else if (filters.balanceStatus === 'zero') {
//       query.currentBalance = 0;
//     }
//   }

//   // Date range filter
//   if (filters.startDate || filters.endDate) {
//     query.createdAt = {};
//     if (filters.startDate) {
//       query.createdAt.$gte = new Date(filters.startDate);
//     }
//     if (filters.endDate) {
//       const endDate = new Date(filters.endDate);
//       endDate.setHours(23, 59, 59, 999);
//       query.createdAt.$lte = endDate;
//     }
//   }

//   const customers = await Customer.find(query)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 });

//   const total = await Customer.countDocuments(query);

//   return {
//     customers,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   };
// };

// export const updateCustomer = async (id, updates) => {
//   const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });
//   if (!customer) {
//     throw { statusCode: 404, message: 'Customer not found' };
//   }
//   return customer;
// };

// export const deleteCustomer = async (id) => {
//   const customer = await Customer.findByIdAndDelete(id);
//   if (!customer) {
//     throw { statusCode: 404, message: 'Customer not found' };
//   }
//   return { message: 'Customer deleted successfully' };
// };

// export const updateCustomerBalance = async (customerId, amount) => {
//   const customer = await Customer.findByIdAndUpdate(
//     customerId,
//     { $inc: { currentBalance: amount } },
//     { new: true }
//   );
//   return customer;
// };

// export const getCustomerLedger = async (customerId, filters = {}) => {
//   const customer = await Customer.findById(customerId);
//   if (!customer) {
//     throw { statusCode: 404, message: 'Customer not found' };
//   }

//   const query = { 
//     accountId: customerId, 
//     accountType: 'customer',
//     isDeleted: false 
//   };

//   // Type filter
//   if (filters.transactionType) {
//     query.type = filters.transactionType;
//   }

//   // Date range
//   if (filters.startDate || filters.endDate) {
//     query.createdAt = {};
//     if (filters.startDate) {
//       query.createdAt.$gte = new Date(filters.startDate);
//     }
//     if (filters.endDate) {
//       const endDate = new Date(filters.endDate);
//       endDate.setHours(23, 59, 59, 999);
//       query.createdAt.$lte = endDate;
//     }
//   }

//   // Item filter
//   if (filters.itemId) {
//     query['items.itemId'] = filters.itemId;
//   }

//   // Search
//   if (filters.search) {
//     query.$or = [
//       { transactionId: { $regex: filters.search, $options: 'i' } },
//       { 'items.itemName': { $regex: filters.search, $options: 'i' } }
//     ];
//   }

//   const page = filters.page || 1;
//   const limit = filters.limit || 50;
//   const skip = (page - 1) * limit;

//   const transactions = await Transaction.find(query)
//     .populate('createdBy', 'name email')
//     .populate('updatedBy', 'name email')
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const total = await Transaction.countDocuments(query);

//   // Calculate summary
//   const summary = await Transaction.aggregate([
//     { $match: { accountId: customer._id, accountType: 'customer', isDeleted: false } },
//     {
//       $group: {
//         _id: null,
//         totalOrders: {
//           $sum: {
//             $cond: [{ $eq: ['$type', 'sale'] }, '$totalAmount', 0]
//           }
//         },
//         totalPayments: {
//           $sum: {
//             $cond: [{ $eq: ['$type', 'payment'] }, '$totalAmount', 0]
//           }
//         },
//         totalReturns: {
//           $sum: {
//             $cond: [{ $eq: ['$type', 'return'] }, '$totalAmount', 0]
//           }
//         }
//       }
//     }
//   ]);

//   return {
//     customer,
//     transactions,
//     summary: summary[0] || { totalOrders: 0, totalPayments: 0, totalReturns: 0 },
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   };
// };