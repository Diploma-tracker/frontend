import { format, type Locale } from 'date-fns';
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
