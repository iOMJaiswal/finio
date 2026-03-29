import type {
  MonthlySummary, Transaction, MonthlyTotal, CategoryBreakdown,
  NetWorthPoint, SpendingTrendPoint, Budget, Goal, IncomeSource,
  MonthlySavingsRow, CategoryDeepDive,
} from '../types';

const BASE = '/api';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// Summary
export function fetchSummary(month: string): Promise<MonthlySummary> {
  return fetchJSON(`/summary?month=${month}`);
}

// Transactions
export function fetchTransactions(params: Record<string, string>): Promise<{
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams(params).toString();
  return fetchJSON(`/transactions?${qs}`);
}

export function fetchMonthlyTotals(months: number, month: string): Promise<MonthlyTotal[]> {
  return fetchJSON(`/transactions/monthly-totals?months=${months}&month=${month}`);
}

export function fetchByCategory(month: string): Promise<CategoryBreakdown[]> {
  return fetchJSON(`/transactions/by-category?month=${month}`);
}

export function fetchNetWorthHistory(months: number, month: string): Promise<NetWorthPoint[]> {
  return fetchJSON(`/transactions/net-worth-history?months=${months}&month=${month}`);
}

export function fetchSpendingTrends(months: number, month: string): Promise<SpendingTrendPoint[]> {
  return fetchJSON(`/transactions/spending-trends?months=${months}&month=${month}`);
}

export function fetchIncomeBreakdown(months: number, month: string): Promise<{ sources: IncomeSource[]; totalIncome: number }> {
  return fetchJSON(`/transactions/income-breakdown?months=${months}&month=${month}`);
}

export function fetchMonthlySavings(months: number, month: string): Promise<MonthlySavingsRow[]> {
  return fetchJSON(`/transactions/monthly-savings?months=${months}&month=${month}`);
}

export function fetchCategoryDeepDive(category: string, months: number, month: string): Promise<CategoryDeepDive> {
  return fetchJSON(`/transactions/category-deep-dive?category=${encodeURIComponent(category)}&months=${months}&month=${month}`);
}

// Budgets
export function fetchBudgets(month: string): Promise<Budget[]> {
  return fetchJSON(`/budgets?month=${month}`);
}

export function updateBudget(id: number, monthly_limit: number): Promise<{ success: boolean }> {
  return fetchJSON(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ monthly_limit }),
  });
}

export function createBudget(data: { category: string; monthly_limit: number; color: string; icon: string }): Promise<{ id: number; success: boolean }> {
  return fetchJSON('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteBudget(id: number): Promise<{ success: boolean }> {
  return fetchJSON(`/budgets/${id}`, { method: 'DELETE' });
}

// Goals
export function fetchGoals(): Promise<Goal[]> {
  return fetchJSON('/goals');
}

export function createGoal(data: { name: string; emoji: string; target_amount: number; current_amount: number; target_date: string; color: string }): Promise<{ id: number; success: boolean }> {
  return fetchJSON('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function contributeToGoal(id: number, amount: number): Promise<{ success: boolean; current_amount: number }> {
  return fetchJSON(`/goals/${id}/contribute`, {
    method: 'PATCH',
    body: JSON.stringify({ amount }),
  });
}

export function deleteGoal(id: number): Promise<{ success: boolean }> {
  return fetchJSON(`/goals/${id}`, { method: 'DELETE' });
}
