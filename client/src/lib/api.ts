import type {
  MonthlySummary, Transaction, MonthlyTotal, CategoryBreakdown,
  NetWorthPoint, SpendingTrendPoint, Budget, Goal, IncomeSource,
  MonthlySavingsRow, CategoryDeepDive,
} from '../types';

const BASE = '/api';

const warnedFallbacks = new Set<string>();

const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: '2026-03-03',
    merchant: 'Employer Payroll',
    category: 'Salary',
    type: 'income',
    amount: 85000,
    balance_after: 232500,
    notes: 'Monthly salary',
  },
  {
    id: 2,
    date: '2026-03-05',
    merchant: 'Fresh Basket',
    category: 'Groceries',
    type: 'expense',
    amount: 7600,
    balance_after: 224900,
    notes: 'Weekly groceries',
  },
  {
    id: 3,
    date: '2026-03-08',
    merchant: 'FuelUp',
    category: 'Transport',
    type: 'expense',
    amount: 3200,
    balance_after: 221700,
    notes: 'Fuel and toll',
  },
  {
    id: 4,
    date: '2026-03-11',
    merchant: 'Landlord',
    category: 'Rent',
    type: 'expense',
    amount: 22000,
    balance_after: 199700,
    notes: 'Monthly rent',
  },
  {
    id: 5,
    date: '2026-03-15',
    merchant: 'Freelance Client',
    category: 'Freelance',
    type: 'income',
    amount: 18000,
    balance_after: 217700,
    notes: 'Design milestone',
  },
  {
    id: 6,
    date: '2026-02-03',
    merchant: 'Employer Payroll',
    category: 'Salary',
    type: 'income',
    amount: 82000,
    balance_after: 196000,
    notes: 'Monthly salary',
  },
  {
    id: 7,
    date: '2026-02-10',
    merchant: 'SuperMart',
    category: 'Groceries',
    type: 'expense',
    amount: 6800,
    balance_after: 189200,
    notes: 'Groceries',
  },
  {
    id: 8,
    date: '2026-02-12',
    merchant: 'MetroCard',
    category: 'Transport',
    type: 'expense',
    amount: 2400,
    balance_after: 186800,
    notes: 'Commute recharge',
  },
  {
    id: 9,
    date: '2026-01-04',
    merchant: 'Employer Payroll',
    category: 'Salary',
    type: 'income',
    amount: 80000,
    balance_after: 164000,
    notes: 'Monthly salary',
  },
  {
    id: 10,
    date: '2026-01-14',
    merchant: 'City Rentals',
    category: 'Rent',
    type: 'expense',
    amount: 21000,
    balance_after: 143000,
    notes: 'Monthly rent',
  },
];

const dummyBudgetDefs: Array<{ id: number; category: string; monthly_limit: number; color: string; icon: string }> = [
  { id: 1, category: 'Groceries', monthly_limit: 12000, color: '#16a34a', icon: 'shopping-cart' },
  { id: 2, category: 'Transport', monthly_limit: 7000, color: '#0ea5e9', icon: 'car' },
  { id: 3, category: 'Rent', monthly_limit: 24000, color: '#f97316', icon: 'home' },
  { id: 4, category: 'Entertainment', monthly_limit: 6000, color: '#a855f7', icon: 'film' },
];

let dummyGoals: Goal[] = [
  {
    id: 1,
    name: 'Emergency Fund',
    emoji: 'EF',
    target_amount: 300000,
    current_amount: 132000,
    target_date: '2026-12-31',
    color: '#22c55e',
    created_at: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 2,
    name: 'Goa Vacation',
    emoji: 'GV',
    target_amount: 90000,
    current_amount: 28000,
    target_date: '2026-09-15',
    color: '#06b6d4',
    created_at: '2026-02-01T09:00:00.000Z',
  },
];

function warnFallback(scope: string, error: unknown): void {
  if (warnedFallbacks.has(scope)) return;
  warnedFallbacks.add(scope);
  console.warn(`[offline-fallback] ${scope}: backend unavailable, serving dummy data.`, error);
}

async function withFallback<T>(scope: string, request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    warnFallback(scope, error);
    return fallback();
  }
}

function normalizeMonth(month: string): string {
  return /^\d{4}-\d{2}$/.test(month) ? month : new Date().toISOString().slice(0, 7);
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function getMonthSequence(month: string, count: number): string[] {
  const safeCount = Math.max(1, count);
  const [year, mon] = normalizeMonth(month).split('-').map(Number);
  const anchor = new Date(year, mon - 1, 1);
  const out: string[] = [];
  for (let i = safeCount - 1; i >= 0; i -= 1) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

function monthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleString('en-US', { month: 'short' });
}

function monthlyTotalsFor(month: string): { income: number; expenses: number; net: number } {
  const txns = DUMMY_TRANSACTIONS.filter((t) => monthKey(t.date) === month);
  const income = sum(txns.filter((t) => t.type === 'income').map((t) => t.amount));
  const expenses = sum(txns.filter((t) => t.type === 'expense').map((t) => t.amount));
  return { income, expenses, net: income - expenses };
}

function buildBudgets(month: string): Budget[] {
  return dummyBudgetDefs.map((def) => {
    const expenses = DUMMY_TRANSACTIONS
      .filter((t) => monthKey(t.date) === month && t.type === 'expense' && t.category === def.category);
    const spent = sum(expenses.map((t) => t.amount));
    const recentTransactions = expenses
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
      .map((t) => ({ id: t.id, date: t.date, merchant: t.merchant, amount: t.amount }));
    const remaining = Math.max(0, def.monthly_limit - spent);
    const percentage = def.monthly_limit > 0 ? Math.min(100, Math.round((spent / def.monthly_limit) * 100)) : 0;
    return {
      ...def,
      spent,
      remaining,
      percentage,
      recentTransactions,
    };
  });
}

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
export async function fetchSummary(month: string): Promise<MonthlySummary> {
  return withFallback('summary', () => fetchJSON(`/summary?month=${month}`), () => {
    const safeMonth = normalizeMonth(month);
    const series = getMonthSequence(safeMonth, 6).map((m) => {
      const totals = monthlyTotalsFor(m);
      return {
        month: monthLabel(m),
        income: totals.income,
        expenses: totals.expenses,
        balance: totals.net,
        savingsRate: totals.income > 0 ? Math.round((totals.net / totals.income) * 100) : 0,
      };
    });
    const current = monthlyTotalsFor(safeMonth);
    const previous = monthlyTotalsFor(getMonthSequence(safeMonth, 2)[0]);
    const latestBalance = DUMMY_TRANSACTIONS.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.balance_after ?? 0;
    return {
      totalBalance: latestBalance,
      monthlyIncome: current.income,
      monthlyExpenses: current.expenses,
      savingsRate: current.income > 0 ? Math.round((current.net / current.income) * 100) : 0,
      vsLastMonth: {
        balance: current.net - previous.net,
        income: current.income - previous.income,
        expenses: current.expenses - previous.expenses,
        savings: current.net - previous.net,
      },
      sparkline: series,
    };
  });
}

// Transactions
export async function fetchTransactions(params: Record<string, string>): Promise<{
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const qs = new URLSearchParams(params).toString();
  return withFallback('transactions.list', () => fetchJSON(`/transactions?${qs}`), () => {
    let txns = DUMMY_TRANSACTIONS.slice();
    const search = (params.search || '').trim().toLowerCase();
    if (search) {
      txns = txns.filter((t) =>
        t.merchant.toLowerCase().includes(search)
        || t.category.toLowerCase().includes(search)
        || t.notes.toLowerCase().includes(search)
      );
    }

    if (params.type && params.type !== 'all') {
      txns = txns.filter((t) => t.type === params.type);
    }

    if (params.category) {
      const categories = params.category.split(',').map((s) => s.trim()).filter(Boolean);
      if (categories.length > 0) {
        txns = txns.filter((t) => categories.includes(t.category));
      }
    }

    if (params.dateFrom) {
      txns = txns.filter((t) => t.date >= params.dateFrom);
    }
    if (params.dateTo) {
      txns = txns.filter((t) => t.date <= params.dateTo);
    }

    switch (params.sort) {
      case 'date_asc':
        txns.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case 'amount_desc':
        txns.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_asc':
        txns.sort((a, b) => a.amount - b.amount);
        break;
      case 'merchant_asc':
        txns.sort((a, b) => a.merchant.localeCompare(b.merchant));
        break;
      case 'merchant_desc':
        txns.sort((a, b) => b.merchant.localeCompare(a.merchant));
        break;
      default:
        txns.sort((a, b) => b.date.localeCompare(a.date));
        break;
    }

    const page = Math.max(1, Number(params.page || '1'));
    const limit = Math.max(1, Number(params.limit || '10'));
    const total = txns.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      transactions: txns.slice(start, start + limit),
      total,
      page,
      totalPages,
    };
  });
}

export async function fetchMonthlyTotals(months: number, month: string): Promise<MonthlyTotal[]> {
  return withFallback(
    'transactions.monthlyTotals',
    () => fetchJSON(`/transactions/monthly-totals?months=${months}&month=${month}`),
    () => getMonthSequence(month, months).map((m) => {
      const totals = monthlyTotalsFor(m);
      return { month: monthLabel(m), ...totals };
    }),
  );
}

export async function fetchByCategory(month: string): Promise<CategoryBreakdown[]> {
  return withFallback('transactions.byCategory', () => fetchJSON(`/transactions/by-category?month=${month}`), () => {
    const safeMonth = normalizeMonth(month);
    const expenses = DUMMY_TRANSACTIONS.filter((t) => monthKey(t.date) === safeMonth && t.type === 'expense');
    const total = sum(expenses.map((t) => t.amount));
    const grouped = new Map<string, number>();
    for (const txn of expenses) {
      grouped.set(txn.category, (grouped.get(txn.category) ?? 0) + txn.amount);
    }
    const colors = new Map(dummyBudgetDefs.map((b) => [b.category, b.color]));
    return Array.from(grouped.entries())
      .map(([category, value]) => ({
        category,
        total: value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colors.get(category) ?? '#64748b',
      }))
      .sort((a, b) => b.total - a.total);
  });
}

export async function fetchNetWorthHistory(months: number, month: string): Promise<NetWorthPoint[]> {
  return withFallback(
    'transactions.netWorthHistory',
    () => fetchJSON(`/transactions/net-worth-history?months=${months}&month=${month}`),
    () => {
      const seq = getMonthSequence(month, months);
      let running = 120000;
      return seq.map((m) => {
        running += monthlyTotalsFor(m).net;
        return { month: monthLabel(m), netWorth: running };
      });
    },
  );
}

export async function fetchSpendingTrends(months: number, month: string): Promise<SpendingTrendPoint[]> {
  return withFallback(
    'transactions.spendingTrends',
    () => fetchJSON(`/transactions/spending-trends?months=${months}&month=${month}`),
    () => getMonthSequence(month, months).map((m) => {
      const row: SpendingTrendPoint = { month: monthLabel(m) };
      for (const budget of dummyBudgetDefs) {
        row[budget.category] = sum(
          DUMMY_TRANSACTIONS
            .filter((t) => monthKey(t.date) === m && t.type === 'expense' && t.category === budget.category)
            .map((t) => t.amount),
        );
      }
      return row;
    }),
  );
}

export async function fetchIncomeBreakdown(months: number, month: string): Promise<{ sources: IncomeSource[]; totalIncome: number }> {
  return withFallback(
    'transactions.incomeBreakdown',
    () => fetchJSON(`/transactions/income-breakdown?months=${months}&month=${month}`),
    () => {
      const includedMonths = new Set(getMonthSequence(month, months));
      const incomes = DUMMY_TRANSACTIONS.filter((t) => t.type === 'income' && includedMonths.has(monthKey(t.date)));
      const totalIncome = sum(incomes.map((t) => t.amount));
      const grouped = new Map<string, number>();
      for (const txn of incomes) {
        grouped.set(txn.merchant, (grouped.get(txn.merchant) ?? 0) + txn.amount);
      }
      const sources = Array.from(grouped.entries())
        .map(([source, total]) => ({
          source,
          total,
          percentage: totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);
      return { sources, totalIncome };
    },
  );
}

export async function fetchMonthlySavings(months: number, month: string): Promise<MonthlySavingsRow[]> {
  return withFallback(
    'transactions.monthlySavings',
    () => fetchJSON(`/transactions/monthly-savings?months=${months}&month=${month}`),
    () => getMonthSequence(month, months).map((m) => {
      const totals = monthlyTotalsFor(m);
      return {
        month: monthLabel(m),
        income: totals.income,
        expenses: totals.expenses,
        savings: totals.net,
        savingsRate: totals.income > 0 ? Math.round((totals.net / totals.income) * 100) : 0,
      };
    }),
  );
}

export async function fetchCategoryDeepDive(category: string, months: number, month: string): Promise<CategoryDeepDive> {
  return withFallback(
    'transactions.categoryDeepDive',
    () => fetchJSON(`/transactions/category-deep-dive?category=${encodeURIComponent(category)}&months=${months}&month=${month}`),
    () => {
      const includedMonths = getMonthSequence(month, months);
      const includedSet = new Set(includedMonths);
      const scoped = DUMMY_TRANSACTIONS
        .filter((t) => t.type === 'expense' && t.category === category && includedSet.has(monthKey(t.date)));
      const monthlySpending = includedMonths.map((m) => ({
        month: monthLabel(m),
        total: sum(scoped.filter((t) => monthKey(t.date) === m).map((t) => t.amount)),
      }));
      const avgMonthly = monthlySpending.length > 0
        ? Math.round(sum(monthlySpending.map((m) => m.total)) / monthlySpending.length)
        : 0;

      const grouped = new Map<string, { total: number; count: number }>();
      for (const txn of scoped) {
        const curr = grouped.get(txn.merchant) ?? { total: 0, count: 0 };
        curr.total += txn.amount;
        curr.count += 1;
        grouped.set(txn.merchant, curr);
      }
      const topMerchants = Array.from(grouped.entries())
        .map(([merchant, value]) => ({ merchant, total: value.total, count: value.count }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      const biggestTransaction = scoped.slice().sort((a, b) => b.amount - a.amount)[0] ?? null;

      return { monthlySpending, avgMonthly, topMerchants, biggestTransaction };
    },
  );
}

// Budgets
export async function fetchBudgets(month: string): Promise<Budget[]> {
  return withFallback('budgets.list', () => fetchJSON(`/budgets?month=${month}`), () => buildBudgets(normalizeMonth(month)));
}

export async function updateBudget(id: number, monthly_limit: number): Promise<{ success: boolean }> {
  return withFallback(
    'budgets.update',
    () => fetchJSON(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ monthly_limit }),
    }),
    () => {
      const budget = dummyBudgetDefs.find((b) => b.id === id);
      if (budget) budget.monthly_limit = monthly_limit;
      return { success: true };
    },
  );
}

export async function createBudget(data: { category: string; monthly_limit: number; color: string; icon: string }): Promise<{ id: number; success: boolean }> {
  return withFallback(
    'budgets.create',
    () => fetchJSON('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    () => {
      const nextId = Math.max(0, ...dummyBudgetDefs.map((b) => b.id)) + 1;
      dummyBudgetDefs.push({ id: nextId, ...data });
      return { id: nextId, success: true };
    },
  );
}

export async function deleteBudget(id: number): Promise<{ success: boolean }> {
  return withFallback('budgets.delete', () => fetchJSON(`/budgets/${id}`, { method: 'DELETE' }), () => {
    const idx = dummyBudgetDefs.findIndex((b) => b.id === id);
    if (idx >= 0) dummyBudgetDefs.splice(idx, 1);
    return { success: true };
  });
}

// Goals
export async function fetchGoals(): Promise<Goal[]> {
  return withFallback('goals.list', () => fetchJSON('/goals'), () => dummyGoals.slice());
}

export async function createGoal(data: { name: string; emoji: string; target_amount: number; current_amount: number; target_date: string; color: string }): Promise<{ id: number; success: boolean }> {
  return withFallback(
    'goals.create',
    () => fetchJSON('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    () => {
      const nextId = Math.max(0, ...dummyGoals.map((g) => g.id)) + 1;
      dummyGoals.push({ id: nextId, created_at: new Date().toISOString(), ...data });
      return { id: nextId, success: true };
    },
  );
}

export async function contributeToGoal(id: number, amount: number): Promise<{ success: boolean; current_amount: number }> {
  return withFallback(
    'goals.contribute',
    () => fetchJSON(`/goals/${id}/contribute`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),
    () => {
      const goal = dummyGoals.find((g) => g.id === id);
      if (!goal) {
        return { success: true, current_amount: amount };
      }
      goal.current_amount = Math.max(0, goal.current_amount + amount);
      return { success: true, current_amount: goal.current_amount };
    },
  );
}

export async function deleteGoal(id: number): Promise<{ success: boolean }> {
  return withFallback('goals.delete', () => fetchJSON(`/goals/${id}`, { method: 'DELETE' }), () => {
    dummyGoals = dummyGoals.filter((g) => g.id !== id);
    return { success: true };
  });
}
