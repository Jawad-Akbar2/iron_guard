import express from 'express';
import * as accountsController from '../controllers/accountsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all accounts (unified)
router.get('/', authMiddleware, accountsController.getAllAccounts);

// Customer routes
router.post('/customers', authMiddleware, accountsController.createCustomer);
router.get('/customers/:id', authMiddleware, accountsController.getCustomerAccount);
router.put('/customers/:id', authMiddleware, accountsController.updateCustomer);
router.delete('/customers/:id', authMiddleware, accountsController.deleteCustomer);

// Supplier routes
router.post('/suppliers', authMiddleware, accountsController.createSupplier);
router.get('/suppliers/:id', authMiddleware, accountsController.getSupplierAccount);
router.put('/suppliers/:id', authMiddleware, accountsController.updateSupplier);
router.delete('/suppliers/:id', authMiddleware, accountsController.deleteSupplier);

// Ledger routes (must be after specific routes)
router.get('/:accountType/:id/ledger', authMiddleware, accountsController.getAccountLedger);

export default router;