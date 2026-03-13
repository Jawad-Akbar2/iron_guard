import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create transaction
router.post('/', authMiddleware, transactionController.createTransaction);

// Get all transactions (ledger)
router.get('/', authMiddleware, transactionController.getAllTransactions);

// Get transaction by MongoDB _id
router.get('/:id', authMiddleware, transactionController.getTransactionById);

// Get transaction by Transaction ID (e.g., SAL-2024-XXXXX)
router.get('/txn/:txnId', authMiddleware, transactionController.getTransactionByTxnId);

// Get receipt
router.get('/receipt/:txnId', authMiddleware, transactionController.getReceipt);

// Update transaction
router.put('/:txnId', authMiddleware, transactionController.updateTransaction);

// Soft delete transaction
router.delete('/:txnId', authMiddleware, transactionController.softDeleteTransaction);

export default router;