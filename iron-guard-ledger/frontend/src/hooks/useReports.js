import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api.js';

export const useAggregatedReports = (filters = {}) => {
  return useQuery({
    queryKey: ['aggregated-reports', filters],
    queryFn: () => reportAPI.getAggregatedReports(filters),
    staleTime: 5 * 60 * 1000
  });
};

export const useDailyReport = (filters = {}) => {
  return useQuery({
    queryKey: ['daily-report', filters],
    queryFn: () => reportAPI.getDailyReport(filters),
    staleTime: 5 * 60 * 1000
  });
};

export const useMonthlyReport = (filters = {}) => {
  return useQuery({
    queryKey: ['monthly-report', filters],
    queryFn: () => reportAPI.getMonthlyReport(filters),
    staleTime: 5 * 60 * 1000
  });
};

export const useDashboardKPIs = (filters = {}) => {
  return useQuery({
    queryKey: ['dashboard-kpis', filters],
    queryFn: () => reportAPI.getDashboardKPIs(filters),
    staleTime: 5 * 60 * 1000
  });
};