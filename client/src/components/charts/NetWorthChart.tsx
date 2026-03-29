import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card } from '../ui/Card';
import { useNetWorthHistory } from '../../hooks/useTransactions';
import { formatCurrencyCompact, formatCurrency, formatShortMonth } from '../../lib/formatters';
import { ChartSkeleton } from '../ui/Skeleton';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-bg-elevated p-3 shadow-xl">
      <p className="text-xs text-txt-secondary mb-1">{label}</p>
      <p className="text-sm font-semibold text-txt-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function NetWorthChart() {
  const { data, isLoading } = useNetWorthHistory(12);

  if (isLoading) return <ChartSkeleton height="h-[320px]" />;

  const chartData = (data || []).map(d => ({
    ...d,
    label: formatShortMonth(d.month),
  }));

  const first = chartData[0]?.netWorth || 0;
  const last = chartData[chartData.length - 1]?.netWorth || 0;
  const growth = last - first;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-txt-primary">Net Worth Trend</h3>
          <p className="text-xs mt-0.5">
            <span className={growth >= 0 ? 'text-accent-green' : 'text-accent-red'}>
              {growth >= 0 ? 'Growing' : 'Declining'} {formatCurrency(Math.abs(growth))} since last year
            </span>
          </p>
        </div>
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F7EFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4F7EFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8B8BA8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
            <ReTooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#4F7EFF"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
              isAnimationActive
              animationDuration={800}
              dot={false}
              activeDot={{ r: 5, fill: '#4F7EFF', stroke: '#0A0A0F', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
