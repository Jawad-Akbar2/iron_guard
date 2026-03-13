import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../services/api.js';

export const useCustomers = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['customers', page],
    queryFn: () => customerAPI.getAllCustomers(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useCustomerById = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerAPI.getCustomerById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  });
};

export const useCustomerLedger = (customerId, filters = {}) => {
  return useQuery({
    queryKey: ['customer-ledger', customerId, filters],
    queryFn: () => customerAPI.getCustomerLedger(customerId, filters),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => customerAPI.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerAPI.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => customerAPI.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};