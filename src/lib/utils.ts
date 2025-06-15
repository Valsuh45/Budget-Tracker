import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CURRENCIES } from "@/types/transaction"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  // For XAF and some other currencies that might not be well-supported by Intl
  if (currencyCode === 'XAF') {
    return `${amount.toFixed(2)} FCFA`;
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback in case of unsupported currency
    return `${getCurrencySymbol(currencyCode)}${amount.toFixed(2)}`;
  }
}
