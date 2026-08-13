import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || `item-${Date.now()}`;
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9-]+$/.test(value);
}

export function formatDate(
  value: string | Date | null | undefined,
  locale = 'ar',
): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatMonthYear(
  value: string | Date | null | undefined,
  locale = 'ar',
): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatNumber(value: number, locale = 'ar'): string {
  if (value == null || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function truncate(value: string, length = 160): string {
  if (!value) return '';
  if (value.length <= length) return value;
  return `${value.slice(0, length).trim()}…`;
}

export function getInitials(name: string): string {
  if (!name) return '؟';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}

/** جلب حقل مترجم مع fallback تلقائي للعربية. */
export function pickLang<T>(ar?: T | null, en?: T | null, locale = 'ar'): T | null {
  const value = locale === 'en' && en ? en : ar;
  return value ?? null;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
