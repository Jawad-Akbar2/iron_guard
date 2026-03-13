import * as transactionService from '../services/transactionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Transaction created',
    data: transaction
  });
});

export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id);
  res.json({
    success: true,
    message: 'Transaction fetched',
    data: transaction
  });
});

export const getTransactionByTxnId = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionByTxnId(req.params.txnId);
  res.json({
    success: true,
    message: 'Transaction fetched',
    data: transaction
  });
});

export const getAllTransactions = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    accountType: req.query.accountType,
    customerId: req.query.customerId,
    supplierId: req.query.supplierId,
    itemId: req.query.itemId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50
  };

  const result = await transactionService.getAllTransactions(filters);
  res.json({
    success: true,
    message: 'Transactions fetched',
    data: result
  });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(
    req.params.txnId,
    req.body,
    req.user._id
  );
  res.json({
    success: true,
    message: 'Transaction updated',
    data: transaction
  });
});

export const softDeleteTransaction = asyncHandler(async (req, res) => {
  const result = await transactionService.softDeleteTransaction(
    req.params.txnId,
    req.user._id
  );
  res.json({
    success: true,
    message: result.message,
    data: null
  });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionByTxnId(req.params.txnId);
  res.json({
    success: true,
    message: 'Receipt generated',
    data: transaction
  });
});