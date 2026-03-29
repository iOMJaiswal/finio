import { cn } from '../../lib/formatters';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ value, onChange, options, className }: SelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={cn(
        'appearance-none rounded-lg border border-subtle bg-bg-tertiary px-3 py-2 text-sm text-txt-primary',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue',
        'cursor-pointer hover:border-medium transition-colors',
        className
      )}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-bg-secondary text-txt-primary">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
