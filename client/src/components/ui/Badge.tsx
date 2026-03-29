import { cn } from '../../lib/formatters';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-bg-tertiary text-txt-secondary',
  green: 'bg-accent-green/15 text-accent-green',
  red: 'bg-accent-red/15 text-accent-red',
  amber: 'bg-accent-amber/15 text-accent-amber',
  blue: 'bg-accent-blue/15 text-accent-blue',
  purple: 'bg-accent-purple/15 text-accent-purple',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
