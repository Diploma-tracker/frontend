import { format } from 'date-fns';

import { getLocale } from './locale';

export const DATE_FORMAT = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'dd MMM yyyy, HH:mm';

export const formatDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return format(new Date(value), DATE_FORMAT, { locale: getLocale() });
};

/**
 * Formats a date-time string to a localized human-readable format.
 *
 * @param value - ISO date-time string or null/undefined
 * @returns Formatted date-time string or null if value is empty
 *
 * @example
 * formatDateTime('2024-01-15T14:30:00Z') // '15 Jan 2024, 14:30' (en)
 * formatDateTime('2024-01-15T14:30:00Z') // '15 січ 2024, 14:30' (uk)
 */
export const formatDateTime = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return format(new Date(value), DATE_TIME_FORMAT, { locale: getLocale() });
};

// Re-export locale utility
export { getLocale } from './locale';
