import { cn } from '../../lib/formatters';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'amber' | 'red' | 'blue';
  className?: string;
  animate?: boolean;
}

const barColors: Record<string, string> = {
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
  red: 'bg-accent-red',
  blue: 'bg-accent-blue',
};

export function ProgressBar({ value, max = 100, color = 'blue', className, animate = true }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const isOver = value > max;

  return (
    <div className={cn('w-full h-2 rounded-full bg-white/5', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all',
          isOver ? 'bg-accent-red animate-pulse-red' : barColors[color],
          animate && 'duration-[800ms] ease-out'
        )}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}
