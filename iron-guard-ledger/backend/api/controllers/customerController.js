// import * as customerService from '../services/customerService.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// export const createCustomer = asyncHandler(async (req, res) => {
//   const customer = await customerService.createCustomer(req.body);
//   res.status(201).json({
//     success: true,
//     message: 'Customer created successfully',
//     data: customer
//   });
// });

// export const getCustomerById = asyncHandler(async (req, res) => {
//   const customer = await customerService.getCustomerById(req.params.id);
//   res.json({
//     success: true,
//     message: 'Customer fetched',
//     data: customer
//   });
// });

// export const getAllCustomers = asyncHandler(async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 50;
  
//   const customers = await customerService.getAllCustomers(page, limit);
//   res.json({
//     success: true,
//     message: 'Customers fetched',
//     data: customers
//   });
// });

// export const updateCustomer = asyncHandler(async (req, res) => {
//   const customer = await customerService.updateCustomer(req.params.id, req.body);
//   res.json({
//     success: true,
//     message: 'Customer updated',
//     data: customer
//   });
// });

// export const deleteCustomer = asyncHandler(async (req, res) => {
//   const result = await customerService.deleteCustomer(req.params.id);
//   res.json({
//     success: true,
//     message: result.message,
//     data: null
//   });
// });

// export const getCustomerLedger = asyncHandler(async (req, res) => {
//   const customerId = req.params.id;
//   const filters = {
//     page: parseInt(req.query.page) || 1,
//     limit: parseInt(req.query.limit) || 50,
//     startDate: req.query.startDate,
//     endDate: req.query.endDate,
//     itemId: req.query.itemId,
//     paymentType: req.query.paymentType
//   };

//   const ledger = await customerService.getCustomerLedger(customerId, filters);
//   res.json({
//     success: true,
//     message: 'Customer ledger fetched',
//     data: ledger
//   });
// });