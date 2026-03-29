import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCountUp } from '../../hooks/useCountUp';
import { Card } from './Card';
import { formatCurrency, formatPercentage, cn } from '../../lib/formatters';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  trend: number;
  sparklineData: { value: number }[];
  index?: number;
}

export function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  isCurrency = true,
  isPercentage = false,
  trend,
  sparklineData,
  index = 0,
}: StatCardProps) {
  const animatedValue = useCountUp(value, 700);
  const isPositiveTrend = trend >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  const displayValue = isPercentage
    ? formatPercentage(animatedValue)
    : isCurrency
      ? formatCurrency(Math.round(animatedValue))
      : Math.round(animatedValue).toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Card accentLine>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              <Icon size={20} style={{ color: iconColor }} />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-txt-secondary">
              {label}
            </span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              isPositiveTrend
                ? 'bg-accent-green/10 text-accent-green'
                : 'bg-accent-red/10 text-accent-red'
            )}
          >
            <TrendIcon size={12} />
            {formatPercentage(Math.abs(trend))}
          </div>
        </div>

        <div className="font-display text-[28px] font-bold text-txt-primary mb-3 tabular-nums">
          {displayValue}
        </div>

        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={iconColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
