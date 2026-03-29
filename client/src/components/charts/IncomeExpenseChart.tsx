import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { useMonthlyTotals } from '../../hooks/useTransactions';
import { formatCurrencyCompact, formatCurrency, formatShortMonth } from '../../lib/formatters';
import { ChartSkeleton } from '../ui/Skeleton';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const income = payload.find(p => p.name === 'income')?.value || 0;
  const expenses = payload.find(p => p.name === 'expenses')?.value || 0;
  return (
    <div className="rounded-xl border border-white/10 bg-bg-elevated p-3 shadow-xl">
      <p className="text-xs text-txt-secondary mb-2">{label}</p>
      <p className="text-sm text-accent-green">Income: {formatCurrency(income)}</p>
      <p className="text-sm text-accent-red">Expenses: {formatCurrency(expenses)}</p>
      <p className="text-sm text-txt-primary mt-1 border-t border-subtle pt-1">
        Net: {formatCurrency(income - expenses)}
      </p>
    </div>
  );
}

export function IncomeExpenseChart() {
  const [months, setMonths] = useState('6');
  const { data, isLoading } = useMonthlyTotals(Number(months));

  if (isLoading) return <ChartSkeleton height="h-[380px]" />;

  const chartData = (data || []).map(d => ({
    ...d,
    label: formatShortMonth(d.month),
  }));

  const avgExpense = chartData.length > 0
    ? chartData.reduce((s, d) => s + d.expenses, 0) / chartData.length
    : 0;

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-txt-primary">Income vs Expenses</h3>
          <p className="text-xs text-txt-secondary mt-0.5">Last {months} months</p>
        </div>
        <Select
          value={months}
          onChange={setMonths}
          options={[
            { value: '3', label: '3 months' },
            { value: '6', label: '6 months' },
            { value: '12', label: '12 months' },
          ]}
        />
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
            <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={avgExpense} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.4} />
            <Bar dataKey="income" fill="#4F7EFF" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} />
            <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800} />
            <Legend
              formatter={(value: string) => <span className="text-xs capitalize text-txt-secondary">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
