export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
  currency: string;
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other Expense'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' }
];
