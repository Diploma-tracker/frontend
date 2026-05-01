import { format, intervalToDuration, type Locale } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import i18n from 'i18next';

export const DATE_FORMAT = 'dd MMM yyyy';

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  uk: uk,
};

export const getLocale = (): Locale => DATE_FNS_LOCALES[i18n.language] ?? enUS;

export const formatDate = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return format(new Date(value), DATE_FORMAT, { locale: getLocale() });
};

/**
 * Converts a time interval to ISO 8601 duration format (e.g., "PT1H30M", "PT45M").
 * @param start - The start date of the interval
 * @param end - The end date of the interval
 * @returns ISO 8601 duration string (e.g., "PT1H30M" for 1 hour 30 minutes)
 */
export const intervalToISODuration = (start: Date, end: Date): string => {
  const duration = intervalToDuration({ start, end });
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;

  if (hours === 0 && minutes === 0) {
    return 'PT0S';
  }

  const H = hours > 0 ? `${hours}H` : '';
  const M = minutes > 0 ? `${minutes}M` : '';
  return `PT${H}${M}`;
};
