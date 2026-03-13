import * as accountsService from '../services/accountsService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all accounts
export const getAllAccounts = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    search: req.query.search,
    balanceStatus: req.query.balanceStatus,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50
  };

  const result = await accountsService.getAllAccounts(filters);
  res.json({
    success: true,
    message: 'Accounts fetched',
    data: result
  });
});

// Get account ledger
export const getAccountLedger = asyncHandler(async (req, res) => {
  const { accountType, id } = req.params;
  const filters = {
    transactionType: req.query.transactionType,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    itemId: req.query.itemId,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50
  };

  let ledger;
  if (accountType === 'customer') {
    ledger = await accountsService.getCustomerLedger(id, filters);
  } else if (accountType === 'supplier') {
    ledger = await accountsService.getSupplierLedger(id, filters);
  } else {
    throw { statusCode: 400, message: 'Invalid account type' };
  }

  res.json({
    success: true,
    message: 'Account ledger fetched',
    data: ledger
  });
});

// ============ CUSTOMER OPERATIONS ============

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await accountsService.createCustomer(req.body);
  res.status(201).json({
    success: true,
    message: 'Customer created',
    data: customer
  });
});

export const getCustomerAccount = asyncHandler(async (req, res) => {
  const customer = await accountsService.getCustomerById(req.params.id);
  res.json({
    success: true,
    message: 'Customer fetched',
    data: customer
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await accountsService.updateCustomer(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Customer updated',
    data: customer
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await accountsService.deleteCustomer(req.params.id);
  res.json({
    success: true,
    message: 'Customer deleted',
    data: null
  });
});

// ============ SUPPLIER OPERATIONS ============

export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await accountsService.createSupplier(req.body);
  res.status(201).json({
    success: true,
    message: 'Supplier created',
    data: supplier
  });
});

export const getSupplierAccount = asyncHandler(async (req, res) => {
  const supplier = await accountsService.getSupplierById(req.params.id);
  res.json({
    success: true,
    message: 'Supplier fetched',
    data: supplier
  });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await accountsService.updateSupplier(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Supplier updated',
    data: supplier
  });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  await accountsService.deleteSupplier(req.params.id);
  res.json({
    success: true,
    message: 'Supplier deleted',
    data: null
  });
});