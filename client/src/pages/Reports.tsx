import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChartSkeleton, Skeleton } from '../components/ui/Skeleton';
import { useDateRange } from '../context/DateRangeContext';
import {
  fetchSpendingTrends, fetchIncomeBreakdown, fetchMonthlySavings, fetchCategoryDeepDive,
} from '../lib/api';
import { formatCurrency, formatCurrencyCompact, formatShortMonth, formatPercentage } from '../lib/formatters';
import { EXPENSE_CATEGORIES, CATEGORIES } from '../lib/categories';

const periodOptions = [
  { value: '1', label: 'This Month' },
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'This Year' },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-bg-elevated p-3 shadow-xl max-w-[220px]">
      <p className="text-xs text-txt-secondary mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-txt-secondary">{p.name}</span>
          </span>
          <span className="text-txt-primary tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { activeMonth } = useDateRange();
  const [months, setMonths] = useState('6');
  const [deepDiveCat, setDeepDiveCat] = useState('');
  const numMonths = Number(months);

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['spending-trends', numMonths, activeMonth],
    queryFn: () => fetchSpendingTrends(numMonths, activeMonth),
    staleTime: 60_000,
  });

  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['income-breakdown', numMonths, activeMonth],
    queryFn: () => fetchIncomeBreakdown(numMonths, activeMonth),
    staleTime: 60_000,
  });

  const { data: savingsData, isLoading: savingsLoading } = useQuery({
    queryKey: ['monthly-savings', numMonths, activeMonth],
    queryFn: () => fetchMonthlySavings(numMonths, activeMonth),
    staleTime: 60_000,
  });

  const { data: deepDive, isLoading: deepDiveLoading } = useQuery({
    queryKey: ['category-deep-dive', deepDiveCat, numMonths, activeMonth],
    queryFn: () => fetchCategoryDeepDive(deepDiveCat, numMonths, activeMonth),
    enabled: !!deepDiveCat,
    staleTime: 60_000,
  });

  const trendChartData = (trends || []).map(d => ({
    ...d,
    label: formatShortMonth(d.month),
  }));

  // Find top spending category growth
  const topCategory = (() => {
    if (!trends || trends.length < 2) return null;
    const last = trends[trends.length - 1];
    const first = trends[0];
    let maxGrowth = 0;
    let cat = '';
    for (const c of EXPENSE_CATEGORIES) {
      const growth = (Number(last[c]) || 0) - (Number(first[c]) || 0);
      if (growth > maxGrowth) {
        maxGrowth = growth;
        cat = c;
      }
    }
    return cat ? { category: cat, growth: maxGrowth } : null;
  })();

  const exportCSV = () => {
    if (!savingsData) return;
    const headers = 'Month,Income,Expenses,Savings,Savings Rate\n';
    const rows = savingsData.map(r =>
      `${r.month},${r.income},${r.expenses},${r.savings},${r.savingsRate.toFixed(1)}%`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finio-savings-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-txt-primary">Reports</h2>
        <Select value={months} onChange={setMonths} options={periodOptions} />
      </div>

      {/* Section 1: Spending Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <h3 className="text-base font-semibold text-txt-primary mb-1">Spending Trends</h3>
            <p className="text-xs text-txt-secondary mb-4">Category-wise spending over time</p>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
                    <ReTooltip content={<ChartTooltip />} />
                    {EXPENSE_CATEGORIES.map(cat => (
                      <Line
                        key={cat}
                        type="monotone"
                        dataKey={cat}
                        stroke={CATEGORIES[cat].color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive
                        animationDuration={800}
                      />
                    ))}
                    <Legend
                      formatter={(v: string) => <span className="text-xs text-txt-secondary">{v}</span>}
                      iconType="circle"
                      iconSize={8}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
        <div>
          {topCategory && (
            <Card accentLine>
              <p className="text-xs text-txt-secondary uppercase tracking-wider mb-2">Top growing category</p>
              <p className="text-lg font-semibold text-txt-primary">{topCategory.category}</p>
              <p className="text-sm text-accent-red mt-1">
                +{formatCurrency(topCategory.growth)} vs start of period
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Section 2: Income Breakdown */}
      <Card>
        <h3 className="text-base font-semibold text-txt-primary mb-1">Income Breakdown</h3>
        <p className="text-xs text-txt-secondary mb-4">
          Total Income: {incomeData ? formatCurrency(incomeData.totalIncome) : '—'}
        </p>
        {incomeLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData?.sources || []} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
                <YAxis type="category" dataKey="source" tick={{ fill: '#8B8BA8', fontSize: 11 }} axisLine={false} tickLine={false} width={180} />
                <ReTooltip content={<ChartTooltip />} />
                <Bar dataKey="total" fill="#4F7EFF" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Section 3: Monthly Savings Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-txt-primary">Monthly Savings Rate</h3>
            <p className="text-xs text-txt-secondary mt-0.5">Track your saving consistency</p>
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
        {savingsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="img" aria-label="Monthly savings rate table">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="text-left py-2 text-xs text-txt-secondary font-medium">Month</th>
                  <th className="text-right py-2 text-xs text-txt-secondary font-medium">Income</th>
                  <th className="text-right py-2 text-xs text-txt-secondary font-medium">Expenses</th>
                  <th className="text-right py-2 text-xs text-txt-secondary font-medium">Savings</th>
                  <th className="text-right py-2 text-xs text-txt-secondary font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(savingsData || []).map(row => {
                  const rateColor = row.savingsRate > 30 ? 'green' : row.savingsRate > 15 ? 'amber' : 'red';
                  return (
                    <tr key={row.month} className="border-b border-white/5 hover:bg-bg-tertiary/30">
                      <td className="py-2.5 text-txt-primary">{formatShortMonth(row.month)}</td>
                      <td className="py-2.5 text-right text-accent-green tabular-nums">{formatCurrency(row.income)}</td>
                      <td className="py-2.5 text-right text-accent-red tabular-nums">{formatCurrency(row.expenses)}</td>
                      <td className="py-2.5 text-right text-txt-primary tabular-nums">{formatCurrency(row.savings)}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant={rateColor}>{formatPercentage(row.savingsRate)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {savingsData && savingsData.length > 0 && (
                <tfoot>
                  <tr className="border-t border-subtle font-medium">
                    <td className="py-2.5 text-txt-primary">Average</td>
                    <td className="py-2.5 text-right text-accent-green tabular-nums">
                      {formatCurrency(Math.round(savingsData.reduce((s, r) => s + r.income, 0) / savingsData.length))}
                    </td>
                    <td className="py-2.5 text-right text-accent-red tabular-nums">
                      {formatCurrency(Math.round(savingsData.reduce((s, r) => s + r.expenses, 0) / savingsData.length))}
                    </td>
                    <td className="py-2.5 text-right text-txt-primary tabular-nums">
                      {formatCurrency(Math.round(savingsData.reduce((s, r) => s + r.savings, 0) / savingsData.length))}
                    </td>
                    <td className="py-2.5 text-right text-txt-secondary">
                      {formatPercentage(savingsData.reduce((s, r) => s + r.savingsRate, 0) / savingsData.length)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Card>

      {/* Section 4: Category Deep Dive */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-txt-primary">Category Deep Dive</h3>
          <Select
            value={deepDiveCat}
            onChange={setDeepDiveCat}
            options={[
              { value: '', label: 'Select a category' },
              ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c })),
            ]}
          />
        </div>

        {!deepDiveCat ? (
          <p className="text-sm text-txt-tertiary text-center py-8">Select a category to analyse</p>
        ) : deepDiveLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : deepDive ? (
          <div className="space-y-6">
            {/* Monthly bar chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deepDive.monthlySpending.map(d => ({ ...d, label: formatShortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
                  <ReTooltip content={<ChartTooltip />} />
                  <Bar dataKey="total" fill={CATEGORIES[deepDiveCat]?.color || '#4F7EFF'} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-txt-secondary mb-1">Avg. Monthly</p>
                <p className="font-display text-xl font-bold text-txt-primary tabular-nums">
                  {formatCurrency(Math.round(deepDive.avgMonthly))}
                </p>
              </div>

              <div className="bg-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-txt-secondary mb-2">Top Merchants</p>
                <div className="space-y-1.5">
                  {deepDive.topMerchants.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-txt-secondary truncate">{m.merchant}</span>
                      <span className="text-txt-primary tabular-nums">{formatCurrency(m.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-bg-tertiary rounded-xl p-4">
                <p className="text-xs text-txt-secondary mb-1">Biggest Transaction</p>
                {deepDive.biggestTransaction ? (
                  <>
                    <p className="text-sm text-txt-primary">{deepDive.biggestTransaction.merchant}</p>
                    <p className="font-display text-lg font-bold text-accent-red tabular-nums">
                      {formatCurrency(deepDive.biggestTransaction.amount)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-txt-tertiary">No data</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
