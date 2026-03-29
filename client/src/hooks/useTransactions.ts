import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, fetchMonthlyTotals, fetchByCategory, fetchNetWorthHistory, fetchSpendingTrends } from '../lib/api';
import { useDateRange } from '../context/DateRangeContext';

export function useTransactions(params: Record<string, string>) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useMonthlyTotals(months: number) {
  const { activeMonth } = useDateRange();
  return useQuery({
    queryKey: ['monthly-totals', months, activeMonth],
    queryFn: () => fetchMonthlyTotals(months, activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCategoryBreakdown() {
  const { activeMonth } = useDateRange();
  return useQuery({
    queryKey: ['by-category', activeMonth],
    queryFn: () => fetchByCategory(activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useNetWorthHistory(months: number) {
  const { activeMonth } = useDateRange();
  return useQuery({
    queryKey: ['net-worth', months, activeMonth],
    queryFn: () => fetchNetWorthHistory(months, activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useSpendingTrends(months: number) {
  const { activeMonth } = useDateRange();
  return useQuery({
    queryKey: ['spending-trends', months, activeMonth],
    queryFn: () => fetchSpendingTrends(months, activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
