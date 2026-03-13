import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionAPI } from '../services/api.js';

export const useTransactions = (filters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionAPI.getAllTransactions(filters),
    staleTime: 5 * 60 * 1000
  });
};

export const useTransactionById = (txnId) => {
  return useQuery({
    queryKey: ['transaction', txnId],
    queryFn: () => transactionAPI.getTransactionByTxnId(txnId),
    enabled: !!txnId,
    staleTime: 10 * 60 * 1000
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => transactionAPI.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-reports'] });
    }
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ txnId, data }) => transactionAPI.updateTransaction(txnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (txnId) => transactionAPI.softDeleteTransaction(txnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    }
  });
};