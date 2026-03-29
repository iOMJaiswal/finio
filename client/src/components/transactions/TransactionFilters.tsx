import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EXPENSE_CATEGORIES } from '../../lib/categories';
import type { TransactionFiltersState } from '../../types';

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onChange: (filters: TransactionFiltersState) => void;
}

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasFilters =
    filters.search || filters.category.length > 0 || filters.type !== 'all' ||
    filters.dateFrom || filters.dateTo || filters.sort !== 'date_desc';

  const clearFilters = () => {
    onChange({ search: '', category: [], type: 'all', dateFrom: '', dateTo: '', sort: 'date_desc' });
  };

  const typeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Income', value: 'income' },
    { label: 'Expenses', value: 'expense' },
  ];

  return (
    <div className="space-y-3">
      {/* Mobile filter toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-subtle bg-bg-tertiary text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={() => setMobileOpen(!mobileOpen)}>
          <SlidersHorizontal size={16} />
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-accent-blue" />
          )}
        </Button>
      </div>

      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="pl-9 pr-3 py-2 rounded-lg border border-subtle bg-bg-tertiary text-sm text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-accent-blue w-64"
          />
        </div>

        <Select
          value={filters.category.length === 1 ? filters.category[0] : ''}
          onChange={val => onChange({ ...filters, category: val ? [val] : [] })}
          options={[
            { value: '', label: 'All Categories' },
            ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c })),
            { value: 'Income', label: 'Income' },
          ]}
        />

        <div className="flex gap-1 bg-bg-tertiary rounded-lg p-0.5 border border-subtle">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filters.type === opt.value
                  ? 'bg-accent-blue text-white'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
              onClick={() => onChange({ ...filters, type: opt.value as TransactionFiltersState['type'] })}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-2 rounded-lg border border-subtle bg-bg-tertiary text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => onChange({ ...filters, dateTo: e.target.value })}
          className="px-3 py-2 rounded-lg border border-subtle bg-bg-tertiary text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          placeholder="To"
        />

        <Select
          value={filters.sort}
          onChange={val => onChange({ ...filters, sort: val })}
          options={[
            { value: 'date_desc', label: 'Newest' },
            { value: 'date_asc', label: 'Oldest' },
            { value: 'amount_desc', label: 'Amount (High–Low)' },
            { value: 'amount_asc', label: 'Amount (Low–High)' },
          ]}
        />

        <AnimatePresence>
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={14} /> Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile expanded filters */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden space-y-3"
          >
            <Select
              value={filters.category.length === 1 ? filters.category[0] : ''}
              onChange={val => onChange({ ...filters, category: val ? [val] : [] })}
              options={[
                { value: '', label: 'All Categories' },
                ...EXPENSE_CATEGORIES.map(c => ({ value: c, label: c })),
                { value: 'Income', label: 'Income' },
              ]}
              className="w-full"
            />
            <div className="flex gap-1 bg-bg-tertiary rounded-lg p-0.5 border border-subtle">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filters.type === opt.value
                      ? 'bg-accent-blue text-white'
                      : 'text-txt-secondary hover:text-txt-primary'
                  }`}
                  onClick={() => onChange({ ...filters, type: opt.value as TransactionFiltersState['type'] })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Select
              value={filters.sort}
              onChange={val => onChange({ ...filters, sort: val })}
              options={[
                { value: 'date_desc', label: 'Newest' },
                { value: 'date_asc', label: 'Oldest' },
                { value: 'amount_desc', label: 'Amount (High–Low)' },
                { value: 'amount_asc', label: 'Amount (Low–High)' },
              ]}
              className="w-full"
            />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                <X size={14} /> Clear filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
