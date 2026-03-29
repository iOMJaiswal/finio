import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useDateRange } from '../../context/DateRangeContext';
import { formatMonthYear } from '../../lib/formatters';

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/goals': 'Goals',
  '/reports': 'Reports',
};

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const location = useLocation();
  const { activeMonth } = useDateRange();
  const title = pageTitles[location.pathname] || 'Finio';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-subtle bg-bg-primary/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-txt-secondary hover:text-txt-primary transition-colors"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-txt-primary">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-txt-secondary hidden sm:block">
          {formatMonthYear(activeMonth)}
        </span>
        <button
          className="relative text-txt-secondary hover:text-txt-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-blue" />
        </button>
      </div>
    </header>
  );
}
