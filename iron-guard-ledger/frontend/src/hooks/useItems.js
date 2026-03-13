import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemAPI } from '../services/api.js';

export const useItems = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['items', page],
    queryFn: () => itemAPI.getAllItems(page, limit),
    staleTime: 5 * 60 * 1000
  });
};

export const useItemById = (id) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemAPI.getItemById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => itemAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => itemAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => itemAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
};