import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, PieChart, Target, TrendingUp, X, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useDateRange } from '../../context/DateRangeContext';
import { formatMonthYear } from '../../lib/formatters';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/reports', label: 'Reports', icon: TrendingUp },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const location = useLocation();
  const { activeMonth, goToPrevMonth, goToNextMonth } = useDateRange();

  return (
    <>
      {/* Bottom Tab Bar (always visible on mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-subtle bg-bg-primary/95 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <item.icon
                  size={22}
                  className={isActive ? 'text-accent-blue' : 'text-txt-tertiary'}
                />
                <span className={`text-[10px] ${isActive ? 'text-accent-blue font-medium' : 'text-txt-tertiary'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary rounded-t-2xl border-t border-subtle p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-xl font-bold">
                  <span className="text-accent-blue">fin</span>
                  <span className="text-txt-primary">io</span>
                </h1>
                <button onClick={onClose} className="text-txt-secondary hover:text-txt-primary" aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-bg-tertiary rounded-lg px-3 py-2 mb-6">
                <button onClick={goToPrevMonth} className="text-txt-secondary hover:text-txt-primary p-0.5" aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-txt-primary">
                  {formatMonthYear(activeMonth)}
                </span>
                <button onClick={goToNextMonth} className="text-txt-secondary hover:text-txt-primary p-0.5" aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive ? 'bg-accent-blue/10 text-accent-blue' : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-subtle flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xs font-bold">AM</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-txt-primary">Aryan Mehta</p>
                </div>
                <Settings size={16} className="text-txt-tertiary" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
