import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface DateRangeContextType {
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

const DateRangeContext = createContext<DateRangeContextType | null>(null);

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [activeMonth, setActiveMonth] = useState(getCurrentMonth);

  const goToPrevMonth = useCallback(() => {
    setActiveMonth(prev => {
      const [y, m] = prev.split('-').map(Number);
      const newMonth = m === 1 ? 12 : m - 1;
      const newYear = m === 1 ? y - 1 : y;
      return `${newYear}-${String(newMonth).padStart(2, '0')}`;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setActiveMonth(prev => {
      const [y, m] = prev.split('-').map(Number);
      const newMonth = m === 12 ? 1 : m + 1;
      const newYear = m === 12 ? y + 1 : y;
      return `${newYear}-${String(newMonth).padStart(2, '0')}`;
    });
  }, []);

  return (
    <DateRangeContext.Provider value={{ activeMonth, setActiveMonth, goToPrevMonth, goToNextMonth }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(): DateRangeContextType {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}
