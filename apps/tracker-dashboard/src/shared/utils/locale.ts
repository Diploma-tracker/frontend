import type { Locale } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import i18n from 'i18next';

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  uk: uk,
};

/**
 * Gets the current date-fns locale based on the i18n language setting.
 * @returns The corresponding date-fns locale object
 */
export const getLocale = (): Locale => DATE_FNS_LOCALES[i18n.language] ?? enUS;
