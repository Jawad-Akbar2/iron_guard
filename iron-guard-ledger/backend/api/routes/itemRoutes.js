import express from 'express';
import * as itemController from '../controllers/itemController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All item routes require authentication
router.post('/', authMiddleware, itemController.createItem);
router.get('/', authMiddleware, itemController.getAllItems);
router.get('/:id', authMiddleware, itemController.getItemById);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, roleMiddleware(['Owner']), itemController.deleteItem);

export default router;