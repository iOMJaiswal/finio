import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Receipt, PieChart, Target, TrendingUp, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDateRange } from '../../context/DateRangeContext';
import { formatMonthYear } from '../../lib/formatters';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/reports', label: 'Reports', icon: TrendingUp },
];

export function Sidebar() {
  const location = useLocation();
  const { activeMonth, goToPrevMonth, goToNextMonth } = useDateRange();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-subtle bg-bg-primary z-40">
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-display text-2xl font-bold">
          <span className="text-accent-blue">fin</span>
          <span className="text-txt-primary">io</span>
        </h1>
        <p className="text-[11px] text-txt-tertiary mt-0.5">Your money, finally clear.</p>
      </div>

      <div className="mx-6 my-3 border-t border-subtle" />

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent-blue/8"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-accent-blue"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                size={20}
                className={isActive ? 'text-accent-blue relative z-10' : 'text-txt-secondary group-hover:text-txt-primary relative z-10 transition-colors'}
              />
              <span
                className={`text-sm relative z-10 ${
                  isActive ? 'text-accent-blue font-medium' : 'text-txt-secondary group-hover:text-txt-primary transition-colors'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-4 space-y-3">
        {/* Month stepper */}
        <div className="flex items-center justify-between bg-bg-secondary rounded-lg px-3 py-2">
          <button
            onClick={goToPrevMonth}
            className="text-txt-secondary hover:text-txt-primary transition-colors p-0.5"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium text-txt-primary">
            {formatMonthYear(activeMonth)}
          </span>
          <button
            onClick={goToNextMonth}
            className="text-txt-secondary hover:text-txt-primary transition-colors p-0.5"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xs font-bold">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-txt-primary truncate">Aryan Mehta</p>
          </div>
          <button className="text-txt-tertiary hover:text-txt-secondary transition-colors" aria-label="Settings">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
