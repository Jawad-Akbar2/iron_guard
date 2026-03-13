import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierAPI } from '../services/api.js';

export const useSuppliers = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['suppliers', page],
    queryFn: () => supplierAPI.getAllSuppliers(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useSupplierById = (id) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierAPI.getSupplierById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  });
};

export const useSupplierLedger = (supplierId, filters = {}) => {
  return useQuery({
    queryKey: ['supplier-ledger', supplierId, filters],
    queryFn: () => supplierAPI.getSupplierLedger(supplierId, filters),
    enabled: !!supplierId,
    staleTime: 5 * 60 * 1000
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => supplierAPI.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => supplierAPI.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => supplierAPI.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
};