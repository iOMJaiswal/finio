import { useBudgets } from '../../hooks/useBudget';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '../../lib/formatters';
import { CATEGORIES } from '../../lib/categories';
import { Skeleton } from '../ui/Skeleton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function getBarColor(pct: number): 'green' | 'amber' | 'red' {
  if (pct > 90) return 'red';
  if (pct > 70) return 'amber';
  return 'green';
}

export function BudgetBarChart() {
  const { data, isLoading } = useBudgets();

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </Card>
    );
  }

  const budgets = (data || []).slice(0, 5);

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-txt-primary">Budget Overview</h3>
        <Link to="/budget" className="text-xs text-accent-blue hover:text-accent-blue-light transition-colors">
          Manage →
        </Link>
      </div>

      <div className="space-y-4">
        {budgets.map((budget, i) => {
          const catConfig = CATEGORIES[budget.category];
          const Icon = catConfig?.icon;
          const pct = Math.min(budget.percentage, 100);

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={14} style={{ color: catConfig.color }} />}
                  <span className="text-sm text-txt-primary">{budget.category}</span>
                </div>
                <span className="text-xs text-txt-secondary tabular-nums">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.monthly_limit)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={budget.spent}
                  max={budget.monthly_limit}
                  color={getBarColor(budget.percentage)}
                  className="flex-1"
                />
                <span className="text-[11px] text-txt-tertiary tabular-nums w-8 text-right">
                  {Math.round(pct)}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
