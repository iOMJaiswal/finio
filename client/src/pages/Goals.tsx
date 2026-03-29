import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useGoals, useCreateGoal, useContributeGoal } from '../hooks/useGoals';
import { formatCurrency, formatPercentage } from '../lib/formatters';
import { format, differenceInMonths } from 'date-fns';
import type { Goal } from '../types';

const presetGoals = [
  { name: 'Emergency Fund', emoji: '🛡️', target_amount: 300000, color: '#22C55E' },
  { name: 'Vacation', emoji: '✈️', target_amount: 100000, color: '#3B82F6' },
  { name: 'New Laptop', emoji: '💻', target_amount: 150000, color: '#A855F7' },
  { name: 'Car', emoji: '🚗', target_amount: 500000, color: '#F97316' },
];

function ProgressRing({ percentage, color, size = 120, strokeWidth = 6 }: { percentage: number; color: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
        style={{ transitionDelay: '300ms' }}
      />
      {/* Milestone dots at 25%, 50%, 75%, 100% */}
      {[25, 50, 75, 100].map(milestone => {
        const angle = (milestone / 100) * 2 * Math.PI - Math.PI / 2;
        const dotX = size / 2 + radius * Math.cos(angle);
        const dotY = size / 2 + radius * Math.sin(angle);
        const completed = percentage >= milestone;
        return (
          <circle
            key={milestone}
            cx={dotX}
            cy={dotY}
            r={3}
            fill={completed ? color : 'rgba(255,255,255,0.15)'}
            className="transform rotate-90"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
        );
      })}
    </svg>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const contributeMut = useContributeGoal();
  const [showInput, setShowInput] = useState(false);
  const [amount, setAmount] = useState('');

  const pct = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  const monthsLeft = differenceInMonths(new Date(goal.target_date), new Date());
  const monthlyNeeded = remaining > 0 && monthsLeft > 0 ? remaining / monthsLeft : 0;
  const isOnTrack = monthlyNeeded <= 15000; // simplified heuristic

  const handleContribute = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    await contributeMut.mutateAsync({ id: goal.id, amount: amt });
    setAmount('');
    setShowInput(false);
  };

  return (
    <Card className="flex flex-col items-center text-center">
      <span className="text-4xl mb-2">{goal.emoji}</span>
      <h3 className="font-display text-lg font-semibold text-txt-primary">{goal.name}</h3>
      <p className="text-[13px] text-txt-secondary mt-0.5">
        {formatCurrency(goal.target_amount)} by {format(new Date(goal.target_date), 'MMM yyyy')}
      </p>

      <div className="relative my-4">
        <ProgressRing percentage={pct} color={goal.color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[22px] font-bold text-txt-primary">
            {Math.round(pct)}%
          </span>
        </div>
      </div>

      <p className="text-[13px] text-txt-secondary">
        {formatCurrency(goal.current_amount)} saved of {formatCurrency(goal.target_amount)}
      </p>

      <p className={`text-xs mt-1 ${isOnTrack ? 'text-accent-green' : 'text-accent-red'}`}>
        {pct >= 100 ? 'Completed!' : isOnTrack ? `On track · ~${formatCurrency(Math.round(monthlyNeeded))}/mo` : 'Behind schedule'}
      </p>

      <AnimatePresence>
        {showInput ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full mt-3 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                autoFocus
              />
              <Button size="sm" onClick={handleContribute}>
                Confirm
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setShowInput(true)}>
            <Plus size={14} /> Add funds
          </Button>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Goals() {
  const { data: goals, isLoading } = useGoals();
  const createMut = useCreateGoal();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    emoji: '🎯',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    color: '#4F7EFF',
  });

  const handleCreate = async () => {
    if (!form.name || !form.target_amount || !form.target_date) return;
    await createMut.mutateAsync({
      name: form.name,
      emoji: form.emoji,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      target_date: form.target_date,
      color: form.color,
    });
    setShowModal(false);
    setForm({ name: '', emoji: '🎯', target_amount: '', current_amount: '0', target_date: '', color: '#4F7EFF' });
  };

  const handlePreset = async (preset: typeof presetGoals[0]) => {
    await createMut.mutateAsync({
      name: preset.name,
      emoji: preset.emoji,
      target_amount: preset.target_amount,
      current_amount: 0,
      target_date: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10),
      color: preset.color,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col items-center">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-[120px] w-[120px] rounded-full mb-3" />
                <Skeleton className="h-4 w-40" />
              </div>
            </Card>
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GoalCard goal={goal} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🐷</div>
          <h3 className="text-lg font-semibold text-txt-primary mb-1">Start your first goal</h3>
          <p className="text-sm text-txt-secondary mb-6">Choose a preset or create your own</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto">
            {presetGoals.map(preset => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                className="rounded-xl border border-subtle bg-bg-secondary p-4 hover:border-medium transition-colors text-center"
              >
                <span className="text-2xl block mb-1">{preset.emoji}</span>
                <span className="text-sm text-txt-primary block">{preset.name}</span>
                <span className="text-xs text-txt-tertiary">{formatCurrency(preset.target_amount)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 lg:bottom-8 right-6 w-14 h-14 rounded-full bg-accent-blue hover:bg-accent-blue-light text-white flex items-center justify-center shadow-lg shadow-accent-blue/30 transition-colors active:scale-[0.97] z-30"
        aria-label="New Goal"
      >
        <Plus size={24} />
      </button>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-bg-secondary border border-subtle rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-txt-primary">New Goal</h3>
                  <button onClick={() => setShowModal(false)} className="text-txt-secondary hover:text-txt-primary" aria-label="Close modal">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div>
                      <label htmlFor="goal-emoji" className="text-sm text-txt-secondary mb-1 block">Icon</label>
                      <input
                        id="goal-emoji"
                        value={form.emoji}
                        onChange={e => setForm({ ...form, emoji: e.target.value })}
                        className="w-16 rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-center text-xl focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="goal-name" className="text-sm text-txt-secondary mb-1 block">Name</label>
                      <input
                        id="goal-name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Summer Vacation"
                        className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="goal-target" className="text-sm text-txt-secondary mb-1 block">Target Amount (₹)</label>
                    <input
                      id="goal-target"
                      type="number"
                      value={form.target_amount}
                      onChange={e => setForm({ ...form, target_amount: e.target.value })}
                      placeholder="e.g. 100000"
                      className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="goal-current" className="text-sm text-txt-secondary mb-1 block">Starting Amount (₹)</label>
                    <input
                      id="goal-current"
                      type="number"
                      value={form.current_amount}
                      onChange={e => setForm({ ...form, current_amount: e.target.value })}
                      className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="goal-date" className="text-sm text-txt-secondary mb-1 block">Target Date</label>
                    <input
                      id="goal-date"
                      type="date"
                      value={form.target_date}
                      onChange={e => setForm({ ...form, target_date: e.target.value })}
                      className="w-full rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>

                  <div>
                    <label htmlFor="goal-color" className="text-sm text-txt-secondary mb-1 block">Color</label>
                    <div className="flex gap-2">
                      {['#4F7EFF', '#22C55E', '#F97316', '#A855F7', '#EC4899', '#06B6D4'].map(c => (
                        <button
                          key={c}
                          onClick={() => setForm({ ...form, color: c })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                          aria-label={`Color ${c}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleCreate}>
                    Create Goal
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
