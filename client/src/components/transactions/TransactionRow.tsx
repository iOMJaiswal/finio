import type { Transaction } from '../../types';
import { CATEGORIES } from '../../lib/categories';
import { formatCurrency, cn } from '../../lib/formatters';
import { format } from 'date-fns';

interface TransactionRowProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const catConfig = CATEGORIES[transaction.category] || CATEGORIES['Others'];
  const Icon = catConfig.icon;
  const isIncome = transaction.type === 'income';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-bg-tertiary/50 cursor-pointer transition-colors group"
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: `${catConfig.color}20` }}
      >
        <Icon size={18} style={{ color: catConfig.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-txt-primary truncate">{transaction.merchant}</p>
        <p className="text-xs text-txt-tertiary">{catConfig.label}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p
          className={cn(
            'text-sm font-medium tabular-nums transition-transform group-hover:translate-x-1',
            isIncome ? 'text-accent-green' : 'text-accent-red'
          )}
        >
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-txt-tertiary">
          {format(new Date(transaction.date), 'dd MMM')}
        </p>
      </div>
    </div>
  );
}
