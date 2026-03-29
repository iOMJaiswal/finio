import type { Transaction } from '../../types';
import { TransactionRow } from './TransactionRow';
import { TransactionRowSkeleton } from '../ui/Skeleton';
import { format, isToday, isYesterday } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onRowClick?: (txn: Transaction) => void;
  groupByDate?: boolean;
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM yyyy');
}

export function TransactionList({ transactions, isLoading, onRowClick, groupByDate = false }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        {[...Array(8)].map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 opacity-40">
          <rect x="12" y="8" width="40" height="48" rx="4" stroke="#4A4A68" strokeWidth="2" />
          <line x1="20" y1="20" x2="44" y2="20" stroke="#4A4A68" strokeWidth="2" />
          <line x1="20" y1="28" x2="44" y2="28" stroke="#4A4A68" strokeWidth="2" />
          <line x1="20" y1="36" x2="36" y2="36" stroke="#4A4A68" strokeWidth="2" />
          <circle cx="44" cy="44" r="12" fill="#0A0A0F" stroke="#4A4A68" strokeWidth="2" />
          <line x1="38" y1="38" x2="50" y2="50" stroke="#4A4A68" strokeWidth="2" />
          <line x1="50" y1="38" x2="38" y2="50" stroke="#4A4A68" strokeWidth="2" />
        </svg>
        <p className="text-sm text-txt-secondary">No transactions found</p>
      </div>
    );
  }

  if (!groupByDate) {
    return (
      <div>
        {transactions.map((txn, i) => (
          <div key={txn.id}>
            {i > 0 && <div className="border-t border-white/5" />}
            <TransactionRow transaction={txn} onClick={() => onRowClick?.(txn)} />
          </div>
        ))}
      </div>
    );
  }

  // Group by date
  const groups: Record<string, Transaction[]> = {};
  for (const txn of transactions) {
    const key = txn.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  }

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      {sortedDates.map(date => (
        <div key={date}>
          <div className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-sm py-2 px-2 -mx-2">
            <span className="text-xs font-medium text-txt-secondary uppercase tracking-wider">
              {getDateLabel(date)}
            </span>
          </div>
          {groups[date].map((txn, i) => (
            <div key={txn.id}>
              {i > 0 && <div className="border-t border-white/5" />}
              <TransactionRow transaction={txn} onClick={() => onRowClick?.(txn)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
