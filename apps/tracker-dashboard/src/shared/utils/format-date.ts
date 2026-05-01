import { format } from 'date-fns';

import { getLocale } from './locale';

export const DATE_FORMAT = 'dd MMM yyyy';

export const formatDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return format(new Date(value), DATE_FORMAT, { locale: getLocale() });
};

// Re-export locale utility
export { getLocale } from './locale';
