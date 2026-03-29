export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  balance_after: number;
  notes: string;
}

export interface Budget {
  id: number;
  category: string;
  monthly_limit: number;
  color: string;
  icon: string;
  spent: number;
  remaining: number;
  percentage: number;
  recentTransactions: { id: number; date: string; merchant: string; amount: number }[];
}

export interface Goal {
  id: number;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  color: string;
  created_at: string;
}

export interface MonthlySummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  vsLastMonth: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
  };
  sparkline: SparklinePoint[];
}

export interface SparklinePoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

export interface NetWorthPoint {
  month: string;
  netWorth: number;
}

export interface SpendingTrendPoint {
  month: string;
  [category: string]: string | number;
}

export interface IncomeSource {
  source: string;
  total: number;
  percentage: number;
}

export interface MonthlySavingsRow {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryDeepDive {
  monthlySpending: { month: string; total: number }[];
  avgMonthly: number;
  topMerchants: { merchant: string; total: number; count: number }[];
  biggestTransaction: Transaction | null;
}

export interface TransactionFiltersState {
  search: string;
  category: string[];
  type: 'all' | 'income' | 'expense';
  dateFrom: string;
  dateTo: string;
  sort: string;
}
