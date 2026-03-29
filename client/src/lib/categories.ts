import {
  UtensilsCrossed, Car, ShoppingBag, Zap, Film, Heart,
  MoreHorizontal, Banknote, LucideIcon,
} from 'lucide-react';

export interface CategoryConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  'Food & Dining': { label: 'Food & Dining', color: '#F97316', icon: UtensilsCrossed },
  'Transport': { label: 'Transport', color: '#3B82F6', icon: Car },
  'Shopping': { label: 'Shopping', color: '#A855F7', icon: ShoppingBag },
  'Utilities': { label: 'Utilities', color: '#06B6D4', icon: Zap },
  'Entertainment': { label: 'Entertainment', color: '#EC4899', icon: Film },
  'Health': { label: 'Health', color: '#22C55E', icon: Heart },
  'Others': { label: 'Others', color: '#8B5CF6', icon: MoreHorizontal },
  'Income': { label: 'Income', color: '#22C55E', icon: Banknote },
};

export const EXPENSE_CATEGORIES = Object.keys(CATEGORIES).filter(c => c !== 'Income');
