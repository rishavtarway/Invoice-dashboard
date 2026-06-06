import { useQuery } from '@tanstack/react-query';
import { fetchCustomers, fetchTop5Customers, fetchCustomer } from '../api/customers';
import { fetchSummary } from '../api/summary';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers', 'list'],
    queryFn: fetchCustomers,
    staleTime: 5 * 60_000,
  });
}

export function useTop5Customers() {
  return useQuery({
    queryKey: ['top5'],
    queryFn: fetchTop5Customers,
    staleTime: 60_000,
  });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
    staleTime: 30_000,
  });
}
