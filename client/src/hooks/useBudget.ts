import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBudgets, updateBudget, createBudget, deleteBudget } from '../lib/api';
import { useDateRange } from '../context/DateRangeContext';

export function useBudgets() {
  const { activeMonth } = useDateRange();
  return useQuery({
    queryKey: ['budgets', activeMonth],
    queryFn: () => fetchBudgets(activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, monthly_limit }: { id: number; monthly_limit: number }) =>
      updateBudget(id, monthly_limit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
