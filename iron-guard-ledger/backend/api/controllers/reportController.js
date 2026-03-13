import * as reportService from '../services/reportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAggregatedReports = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    entityId: req.query.entityId,
    type: req.query.type,
    groupBy: req.query.groupBy || '$entityId'
  };

  const reports = await reportService.getAggregatedReports(filters);
  res.json({
    success: true,
    message: 'Reports generated',
    data: reports
  });
});

export const getDailyReport = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    entityId: req.query.entityId
  };

  const report = await reportService.getDailyReport(filters);
  res.json({
    success: true,
    message: 'Daily report generated',
    data: report
  });
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    entityId: req.query.entityId
  };

  const report = await reportService.getMonthlyReport(filters);
  res.json({
    success: true,
    message: 'Monthly report generated',
    data: report
  });
});

export const getDashboardKPIs = asyncHandler(async (req, res) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };

  const kpis = await reportService.getDashboardKPIs(filters);
  res.json({
    success: true,
    message: 'Dashboard KPIs generated',
    data: kpis
  });
});