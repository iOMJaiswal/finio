import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { useDateRange } from '../context/DateRangeContext';
import { fetchTransactions } from '../lib/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatCurrency } from '../lib/formatters';
import { CATEGORIES } from '../lib/categories';
import type { Transaction, TransactionFiltersState } from '../types';

export default function Transactions() {
  const { activeMonth } = useDateRange();
  const [filters, setFilters] = useState<TransactionFiltersState>({
    search: '',
    category: [],
    type: 'all',
    dateFrom: '',
    dateTo: '',
    sort: 'date_desc',
  });
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [notes, setNotes] = useState('');
  const observerRef = useRef<HTMLDivElement>(null);

  const buildParams = useCallback((page: number) => {
    const params: Record<string, string> = {
      month: activeMonth,
      page: String(page),
      limit: '20',
      sort: filters.sort,
    };
    if (filters.search) params.search = filters.search;
    if (filters.category.length > 0) params.category = filters.category.join(',');
    if (filters.type !== 'all') params.type = filters.type;
    return params;
  }, [activeMonth, filters]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['transactions-page', activeMonth, filters],
    queryFn: ({ pageParam = 1 }) => fetchTransactions(buildParams(pageParam as number)),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allTransactions = data?.pages.flatMap(p => p.transactions) || [];
  const totalCount = data?.pages[0]?.total || 0;
  const totalAmount = allTransactions.reduce((s, t) => {
    return s + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const openDetail = (txn: Transaction) => {
    setSelectedTxn(txn);
    setNotes(txn.notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Filters */}
      <Card>
        <TransactionFilters filters={filters} onChange={setFilters} />
      </Card>

      {/* Results summary */}
      <div className="text-sm text-txt-secondary px-1">
        Showing {allTransactions.length} of {totalCount} transactions · Total:{' '}
        <span className={totalAmount >= 0 ? 'text-accent-green' : 'text-accent-red'}>
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Transaction list */}
      <Card>
        <TransactionList
          transactions={allTransactions}
          isLoading={isLoading}
          onRowClick={openDetail}
          groupByDate
        />

        {/* Infinite scroll trigger */}
        <div ref={observerRef} className="h-4" />
        {isFetchingNextPage && (
          <p className="text-center text-xs text-txt-tertiary py-2">Loading more...</p>
        )}
      </Card>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedTxn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:bg-transparent"
              onClick={() => setSelectedTxn(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[380px] bg-bg-secondary border-l border-subtle z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-txt-primary">Transaction Details</h3>
                  <button
                    onClick={() => setSelectedTxn(null)}
                    className="text-txt-secondary hover:text-txt-primary transition-colors"
                    aria-label="Close panel"
                  >
                    <X size={20} />
                  </button>
                </div>

                {(() => {
                  const catConfig = CATEGORIES[selectedTxn.category] || CATEGORIES['Others'];
                  const Icon = catConfig.icon;
                  const isIncome = selectedTxn.type === 'income';

                  return (
                    <div className="space-y-6">
                      {/* Merchant */}
                      <div className="flex flex-col items-center text-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${catConfig.color}20` }}
                        >
                          <Icon size={28} style={{ color: catConfig.color }} />
                        </div>
                        <h4 className="text-lg font-semibold text-txt-primary">{selectedTxn.merchant}</h4>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium mt-1"
                          style={{ backgroundColor: `${catConfig.color}20`, color: catConfig.color }}
                        >
                          {catConfig.label}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="text-center">
                        <p className={`font-display text-3xl font-bold tabular-nums ${isIncome ? 'text-accent-green' : 'text-accent-red'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(selectedTxn.amount)}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 bg-bg-tertiary rounded-xl p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-txt-secondary">Date</span>
                          <span className="text-txt-primary">{format(new Date(selectedTxn.date), 'dd MMM yyyy, EEEE')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-txt-secondary">Type</span>
                          <span className={isIncome ? 'text-accent-green' : 'text-accent-red'}>{selectedTxn.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-txt-secondary">Balance After</span>
                          <span className="text-txt-primary tabular-nums">{formatCurrency(selectedTxn.balance_after)}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label htmlFor="txn-notes" className="text-sm font-medium text-txt-secondary mb-2 block">Notes</label>
                        <textarea
                          id="txn-notes"
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Add a note..."
                          rows={3}
                          className="w-full rounded-xl border border-subtle bg-bg-tertiary p-3 text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                        />
                        <Button size="sm" className="mt-2 w-full" onClick={() => setSelectedTxn(null)}>
                          Save & Close
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
