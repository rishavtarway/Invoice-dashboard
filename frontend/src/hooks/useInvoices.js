import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../api/invoices';

const KEY = ['invoices'];

export function useInvoices(params) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => fetchInvoices(params),
    keepPreviousData: true,
    staleTime: 30_000,
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  });
}

function invalidateAll(queryClient) {
  queryClient.invalidateQueries({ queryKey: KEY });
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['customer'] });
  queryClient.invalidateQueries({ queryKey: ['top5'] });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateInvoice(id, payload),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => invalidateAll(queryClient),
  });
}
