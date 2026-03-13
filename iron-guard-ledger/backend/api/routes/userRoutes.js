import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/me', authMiddleware, userController.getMe);
router.post('/logout', authMiddleware, userController.logout);

// Admin only routes
router.get('/', authMiddleware, roleMiddleware(['Owner']), userController.getAllUsers);
router.put('/:id', authMiddleware, roleMiddleware(['Owner']), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['Owner']), userController.deleteUser);

export default router;