import { type ReactNode } from 'react';
import { cn } from '../../lib/formatters';

interface CardProps {
  children: ReactNode;
  className?: string;
  accentLine?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, accentLine = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'relative rounded-2xl border border-subtle bg-bg-secondary/80 backdrop-blur-xl p-5',
        onClick && 'cursor-pointer hover:border-medium transition-colors',
        className
      )}
    >
      {accentLine && (
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-blue to-transparent" />
      )}
      {children}
    </div>
  );
}
