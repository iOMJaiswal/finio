import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/ui/StatCard';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import { Card } from '../components/ui/Card';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { SpendingDonutChart } from '../components/charts/SpendingDonutChart';
import { NetWorthChart } from '../components/charts/NetWorthChart';
import { BudgetBarChart } from '../components/charts/BudgetBarChart';
import { TransactionList } from '../components/transactions/TransactionList';
import { useDateRange } from '../context/DateRangeContext';
import { fetchSummary, fetchTransactions } from '../lib/api';
import type { MonthlySummary } from '../types';

export default function Dashboard() {
  const { activeMonth } = useDateRange();

  const { data: summary, isLoading: summaryLoading } = useQuery<MonthlySummary>({
    queryKey: ['summary', activeMonth],
    queryFn: () => fetchSummary(activeMonth),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: recentTxns, isLoading: txnsLoading } = useQuery({
    queryKey: ['recent-transactions', activeMonth],
    queryFn: () => fetchTransactions({ month: activeMonth, limit: '8', sort: 'date_desc' }),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryLoading || !summary ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Wallet}
              iconColor="#4F7EFF"
              label="Total Balance"
              value={summary.totalBalance}
              trend={summary.vsLastMonth.balance}
              sparklineData={summary.sparkline.map(s => ({ value: s.balance }))}
              index={0}
            />
            <StatCard
              icon={TrendingUp}
              iconColor="#22C55E"
              label="Monthly Income"
              value={summary.monthlyIncome}
              trend={summary.vsLastMonth.income}
              sparklineData={summary.sparkline.map(s => ({ value: s.income }))}
              index={1}
            />
            <StatCard
              icon={TrendingDown}
              iconColor="#EF4444"
              label="Monthly Expenses"
              value={summary.monthlyExpenses}
              trend={summary.vsLastMonth.expenses}
              sparklineData={summary.sparkline.map(s => ({ value: s.expenses }))}
              index={2}
            />
            <StatCard
              icon={Percent}
              iconColor="#9B6EFF"
              label="Savings Rate"
              value={summary.savingsRate}
              isPercentage
              isCurrency={false}
              trend={summary.vsLastMonth.savings}
              sparklineData={summary.sparkline.map(s => ({ value: s.savingsRate }))}
              index={3}
            />
          </>
        )}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <IncomeExpenseChart />
        </div>
        <div className="lg:col-span-2">
          <SpendingDonutChart />
        </div>
      </div>

      {/* Row 3: Recent Transactions + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-txt-primary">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs text-accent-blue hover:text-accent-blue-light transition-colors">
                View all →
              </Link>
            </div>
            <TransactionList
              transactions={recentTxns?.transactions || []}
              isLoading={txnsLoading}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <BudgetBarChart />
        </div>
      </div>

      {/* Row 4: Net Worth */}
      <NetWorthChart />
    </motion.div>
  );
}
