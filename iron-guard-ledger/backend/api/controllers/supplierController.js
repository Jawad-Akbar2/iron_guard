// import * as supplierService from '../services/supplierService.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// export const createSupplier = asyncHandler(async (req, res) => {
//   const supplier = await supplierService.createSupplier(req.body);
//   res.status(201).json({
//     success: true,
//     message: 'Supplier created successfully',
//     data: supplier
//   });
// });

// export const getSupplierById = asyncHandler(async (req, res) => {
//   const supplier = await supplierService.getSupplierById(req.params.id);
//   res.json({
//     success: true,
//     message: 'Supplier fetched',
//     data: supplier
//   });
// });

// export const getAllSuppliers = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 50;
  
//   const suppliers = await supplierService.getAllSuppliers(page, limit);
//   res.json({
//     success: true,
//     message: 'Suppliers fetched',
//     data: suppliers
//   });
// });

// export const updateSupplier = asyncHandler(async (req, res) => {
//   const supplier = await supplierService.updateSupplier(req.params.id, req.body);
//   res.json({
//     success: true,
//     message: 'Supplier updated',
//     data: supplier
//   });
// });

// export const deleteSupplier = asyncHandler(async (req, res) => {
//   const result = await supplierService.deleteSupplier(req.params.id);
//   res.json({
//     success: true,
//     message: result.message,
//     data: null
//   });
// });

// export const getSupplierLedger = asyncHandler(async (req, res) => {
//   const supplierId = req.params.id;
//   const filters = {
//     page: parseInt(req.query.page) || 1,
//     limit: parseInt(req.query.limit) || 50,
//     startDate: req.query.startDate,
//     endDate: req.query.endDate,
//     itemId: req.query.itemId,
//     paymentType: req.query.paymentType
//   };

//   const ledger = await supplierService.getSupplierLedger(supplierId, filters);
//   res.json({
//     success: true,
//     message: 'Supplier ledger fetched',
//     data: ledger
//   });
// });