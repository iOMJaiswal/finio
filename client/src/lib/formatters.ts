export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${amount < 0 ? '-' : ''}₹${formatted}`;
}

export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}₹${abs}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getAmountColor(amount: number, type?: 'income' | 'expense'): string {
  if (type === 'income' || amount > 0) return 'text-accent-green';
  if (type === 'expense' || amount < 0) return 'text-accent-red';
  return 'text-txt-primary';
}

export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function formatShortMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-IN', { month: 'short' });
}
