// import Supplier from '../models/Supplier.js';
// import Transaction from '../models/Transaction.js';

// // Generate unique supplier ID
// const generateSupplierId = async () => {
//   const lastSupplier = await Supplier.findOne()
//     .sort({ createdAt: -1 })
//     .lean();
  
//   if (!lastSupplier) return 'SUP-0001';
  
//   const lastId = lastSupplier.supplierId;
//   const number = parseInt(lastId.split('-')[1]) + 1;
//   return `SUP-${String(number).padStart(4, '0')}`;
// };

// export const createSupplier = async (supplierData) => {
//   const { name, phone, address } = supplierData;

//   const existing = await Supplier.findOne({ name });
//   if (existing) {
//     throw { statusCode: 400, message: 'Supplier already exists' };
//   }

//   const supplierId = await generateSupplierId();

//   const supplier = new Supplier({
//     supplierId,
//     name,
//     phone: phone || '',
//     address: address || '',
//     currentBalance: 0,
//     status: 'active',
//     totalOrders: 0,
//     totalPayments: 0,
//     totalReturns: 0
//   });

//   await supplier.save();
//   return supplier;
// };

// export const getSupplierById = async (id) => {
//   const supplier = await Supplier.findById(id);
//   if (!supplier) {
//     throw { statusCode: 404, message: 'Supplier not found' };
//   }
//   return supplier;
// };

// export const getSupplierBySupplierId = async (supplierId) => {
//   const supplier = await Supplier.findOne({ supplierId });
//   if (!supplier) {
//     throw { statusCode: 404, message: 'Supplier not found' };
//   }
//   return supplier;
// };

// export const getAllSuppliers = async (page = 1, limit = 50, filters = {}) => {
//   const skip = (page - 1) * limit;
//   const query = {};

//   // Search filter
//   if (filters.search) {
//     query.$or = [
//       { supplierId: { $regex: filters.search, $options: 'i' } },
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

//   const suppliers = await Supplier.find(query)
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 });

//   const total = await Supplier.countDocuments(query);

//   return {
//     suppliers,
//     pagination: {
//       page,
//       limit,
//       total,
//       pages: Math.ceil(total / limit)
//     }
//   };
// };

// export const updateSupplier = async (id, updates) => {
//   const supplier = await Supplier.findByIdAndUpdate(id, updates, { new: true });
//   if (!supplier) {
//     throw { statusCode: 404, message: 'Supplier not found' };
//   }
//   return supplier;
// };

// export const deleteSupplier = async (id) => {
//   const supplier = await Supplier.findByIdAndDelete(id);
//   if (!supplier) {
//     throw { statusCode: 404, message: 'Supplier not found' };
//   }
//   return { message: 'Supplier deleted successfully' };
// };

// export const updateSupplierBalance = async (supplierId, amount) => {
//   const supplier = await Supplier.findByIdAndUpdate(
//     supplierId,
//     { $inc: { currentBalance: amount } },
//     { new: true }
//   );
//   return supplier;
// };

// export const getSupplierLedger = async (supplierId, filters = {}) => {
//   const supplier = await Supplier.findById(supplierId);
//   if (!supplier) {
//     throw { statusCode: 404, message: 'Supplier not found' };
//   }

//   const query = { 
//     accountId: supplierId, 
//     accountType: 'supplier',
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
//     { $match: { accountId: supplier._id, accountType: 'supplier', isDeleted: false } },
//     {
//       $group: {
//         _id: null,
//         totalOrders: {
//           $sum: {
//             $cond: [{ $eq: ['$type', 'purchase'] }, '$totalAmount', 0]
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
//     supplier,
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