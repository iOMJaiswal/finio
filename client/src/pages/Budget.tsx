import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MoreVertical } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { useBudgets, useUpdateBudget, useCreateBudget, useDeleteBudget } from '../hooks/useBudget';
import { useDateRange } from '../context/DateRangeContext';
import { formatCurrency, formatMonthYear } from '../lib/formatters';
import { CATEGORIES, EXPENSE_CATEGORIES } from '../lib/categories';
import type { Budget } from '../types';

function getBarColor(pct: number): 'green' | 'amber' | 'red' {
  if (pct > 90) return 'red';
  if (pct > 70) return 'amber';
  return 'green';
}

export default function BudgetPage() {
  const { activeMonth } = useDateRange();
  const { data: budgets, isLoading } = useBudgets();
  const updateMut = useUpdateBudget();
  const createMut = useCreateBudget();
  const deleteMut = useDeleteBudget();

  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [formCategory, setFormCategory] = useState('');
  const [formLimit, setFormLimit] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const totalBudgeted = (budgets || []).reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = (budgets || []).reduce((s, b) => s + b.spent, 0);

  const openEdit = (b: Budget) => {
    setEditBudget(b);
    setFormLimit(String(b.monthly_limit));
    setIsAddMode(false);
    setMenuOpen(null);
  };

  const openAdd = () => {
    setEditBudget(null);
    setIsAddMode(true);
    setFormCategory('');
    setFormLimit('');
  };

  const handleSave = async () => {
    const limit = parseFloat(formLimit);
    if (isNaN(limit) || limit <= 0) return;

    if (isAddMode && formCategory) {
      const catConfig = CATEGORIES[formCategory];
      await createMut.mutateAsync({
        category: formCategory,
        monthly_limit: limit,
        color: catConfig?.color || '#8B5CF6',
        icon: catConfig?.icon?.displayName || 'MoreHorizontal',
      });
    } else if (editBudget) {
      await updateMut.mutateAsync({ id: editBudget.id, monthly_limit: limit });
    }
    setEditBudget(null);
    setIsAddMode(false);
  };

  const handleDelete = async (id: number) => {
    await deleteMut.mutateAsync(id);
    setMenuOpen(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-txt-primary">Budget</h2>
        <p className="text-sm text-txt-secondary">{formatMonthYear(activeMonth)}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Budgeted', value: totalBudgeted, color: 'text-txt-primary' },
          { label: 'Total Spent', value: totalSpent, color: 'text-accent-red' },
          { label: 'Remaining', value: totalBudgeted - totalSpent, color: totalBudgeted - totalSpent >= 0 ? 'text-accent-green' : 'text-accent-red' },
        ].map(item => (
          <Card key={item.label}>
            <p className="text-xs text-txt-secondary uppercase tracking-wider mb-1">{item.label}</p>
            <p className={`font-display text-2xl font-bold tabular-nums ${item.color}`}>
              {formatCurrency(item.value)}
            </p>
          </Card>
        ))}
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-3 w-full mb-3" />
              <Skeleton className="h-4 w-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(budgets || []).map((budget, i) => {
            const catConfig = CATEGORIES[budget.category];
            const Icon = catConfig?.icon;
            const isOver = budget.spent > budget.monthly_limit;

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="hover:border-medium transition-colors"
                  style={{ borderColor: menuOpen === budget.id ? catConfig?.color + '40' : undefined } as React.CSSProperties}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${catConfig.color}20` }}
                        >
                          <Icon size={16} style={{ color: catConfig.color }} />
                        </div>
                      )}
                      <span className="text-base font-medium text-txt-primary">{budget.category}</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === budget.id ? null : budget.id)}
                        className="text-txt-tertiary hover:text-txt-secondary transition-colors p-1"
                        aria-label="Budget menu"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === budget.id && (
                        <div className="absolute right-0 top-8 bg-bg-elevated border border-subtle rounded-lg shadow-xl py-1 z-20 min-w-[120px]">
                          <button
                            onClick={() => openEdit(budget)}
                            className="w-full text-left px-3 py-2 text-sm text-txt-primary hover:bg-bg-tertiary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="w-full text-left px-3 py-2 text-sm text-accent-red hover:bg-bg-tertiary"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <ProgressBar
                    value={budget.spent}
                    max={budget.monthly_limit}
                    color={getBarColor(budget.percentage)}
                    className="h-2.5 mb-2"
                  />

                  <div className="flex justify-between text-sm">
                    <span className="text-txt-secondary">
                      {formatCurrency(budget.spent)} spent of {formatCurrency(budget.monthly_limit)}
                    </span>
                    <span className={isOver ? 'text-accent-red font-medium' : 'text-txt-secondary'}>
                      {isOver
                        ? `${formatCurrency(budget.spent - budget.monthly_limit)} over`
                        : `${formatCurrency(budget.remaining)} left`
                      }
                    </span>
                  </div>

                  {/* Recent transactions */}
                  {budget.recentTransactions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-subtle space-y-1.5">
                      {budget.recentTransactions.map(txn => (
                        <div key={txn.id} className="flex justify-between text-xs">
                          <span className="text-txt-secondary truncate">{txn.merchant}</span>
                          <span className="text-txt-primary tabular-nums">{formatCurrency(txn.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}

          {/* Add new budget card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (budgets?.length || 0) * 0.05 }}
          >
            <button
              onClick={openAdd}
              className="w-full h-full min-h-[160px] rounded-2xl border-2 border-dashed border-subtle hover:border-medium transition-colors flex flex-col items-center justify-center gap-2 text-txt-tertiary hover:text-txt-secondary"
            >
              <Plus size={24} />
              <span className="text-sm">Add Category</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editBudget || isAddMode) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => { setEditBudget(null); setIsAddMode(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-bg-secondary border border-subtle rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-txt-primary">
                    {isAddMode ? 'Add Budget Category' : 'Edit Budget'}
                  </h3>
                  <button
                    onClick={() => { setEditBudget(null); setIsAddMode(false); }}
                    className="text-txt-secondary hover:text-txt-primary"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {isAddMode ? (
                    <div>
                      <label htmlFor="budget-category" className="text-sm text-txt-secondary mb-1 block">Category</label>
                      <select
                        id="budget-category"
                        value={formCategory}
                        onChange={e => setFormCategory(e.target.value)}
                        className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      >
                        <option value="">Select category</option>
                        {EXPENSE_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm text-txt-secondary mb-1 block">Category</label>
                      <p className="text-sm text-txt-primary">{editBudget?.category}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="budget-limit" className="text-sm text-txt-secondary mb-1 block">Monthly Budget (₹)</label>
                    <input
                      id="budget-limit"
                      type="number"
                      value={formLimit}
                      onChange={e => setFormLimit(e.target.value)}
                      placeholder="e.g. 8000"
                      className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>

                  <Button className="w-full" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
