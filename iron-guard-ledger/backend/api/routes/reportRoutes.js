import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All report routes require authentication
router.get('/aggregated', authMiddleware, reportController.getAggregatedReports);
router.get('/daily', authMiddleware, reportController.getDailyReport);
router.get('/monthly', authMiddleware, reportController.getMonthlyReport);
router.get('/dashboard-kpis', authMiddleware, reportController.getDashboardKPIs);

export default router;