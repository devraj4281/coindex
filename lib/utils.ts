import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ---------- className helper ---------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------- format helpers ---------- */

/**
 * Format currency with international number system
 * Supports locale-aware formatting with currency symbols
 */
export function formatCurrency(
  value: number | null | undefined,
  digits = 2,
  currency = 'USD',
  showSymbol = true,
) {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol ? getCurrencySymbol(currency) + '0.00' : '0.00';
  }

  return value.toLocaleString('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/**
 * Format large numbers with international suffixes (K, M, B, T)
 * Used for market cap, volume, etc.
 */
export function formatInternationalNumber(
  value: number | null | undefined,
  currency = 'USD',
  showSymbol = true,
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol ? getCurrencySymbol(currency) + '0' : '0';
  }

  const absValue = Math.abs(value);
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) {
    return `${sign}${symbol}${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}${symbol}${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${symbol}${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${symbol}${(absValue / 1e3).toFixed(2)}K`;
  }

  return `${sign}${symbol}${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF ',
    CNY: '¥',
    INR: '₹',
    KRW: '₩',
    BTC: '₿',
    ETH: 'Ξ',
  };
  return symbols[currency] || currency + ' ';
}

export function formatPercentage(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

export function formatCompactNumber(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }

  return value.toFixed(2);
}

/* ---------- trend helper ---------- */
export function trendingClasses(value: number) {
  const isUp = value > 0;

  return {
    textClass: isUp ? 'text-green-400' : 'text-red-400',
    bgClass: isUp ? 'bg-green-500/10' : 'bg-red-500/10',
  };
}

/* ---------- time helper ---------- */
export function timeAgo(date: string | number | Date): string {
  const now = Date.now();
  const past = new Date(date).getTime();
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''}`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''}`;

  return new Date(past).toISOString().split('T')[0];
}

/* ---------- pagination helpers ---------- */
export const ELLIPSIS = 'ellipsis' as const;

export function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | typeof ELLIPSIS)[] {
  const MAX_VISIBLE = 5;
  const pages: (number | typeof ELLIPSIS)[] = [];

  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push(ELLIPSIS);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push(ELLIPSIS);

  pages.push(totalPages);

  return pages;
}
