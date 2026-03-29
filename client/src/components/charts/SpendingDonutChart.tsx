import { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Card } from '../ui/Card';
import { useCategoryBreakdown } from '../../hooks/useTransactions';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import { ChartSkeleton } from '../ui/Skeleton';
import { CATEGORIES } from '../../lib/categories';

function renderActiveShape(props: unknown) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number;
    startAngle: number; endAngle: number; fill: string;
  };

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius as number) + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
}

export function SpendingDonutChart() {
  const { data, isLoading } = useCategoryBreakdown();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = useCallback((_: unknown, index: number) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(null), []);

  if (isLoading) return <ChartSkeleton height="h-[380px]" />;

  const chartData = data || [];
  const total = chartData.reduce((s, d) => s + d.total, 0);
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <Card className="h-full">
      <h3 className="text-base font-semibold text-txt-primary mb-1">Spending by Category</h3>
      <p className="text-xs text-txt-secondary mb-4">This month</p>

      <div className="flex flex-col items-center">
        <div className="relative h-[200px] w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="total"
                nameKey="category"
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                isAnimationActive
                animationDuration={800}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-xl font-bold text-txt-primary tabular-nums">
              {formatCurrency(activeItem ? activeItem.total : total)}
            </span>
            <span className="text-[11px] text-txt-tertiary">
              {activeItem ? activeItem.category : 'This month'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full">
          {chartData.map((item, i) => {
            const catConfig = CATEGORIES[item.category];
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-txt-secondary truncate flex-1 text-xs">{item.category}</span>
                <span className="text-txt-primary text-xs font-medium tabular-nums">
                  {formatCurrency(item.total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
