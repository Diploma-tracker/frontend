import { getLocale } from '@/shared/utils/format-date';
import { format } from 'date-fns';
import i18n from 'i18next';

import type { WeekView } from './context';

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(monday: Date, view: WeekView): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + (view === 'full' ? 6 : 4));
  return d;
}

export function formatWeekTitle(monday: Date, view: WeekView): string {
  const locale = getLocale();
  const end = getWeekEnd(monday, view);
  if (monday.getMonth() === end.getMonth()) {
    return `${format(monday, 'MMM d', { locale })} – ${format(end, 'd, yyyy', { locale })}`;
  }
  if (monday.getFullYear() === end.getFullYear()) {
    return `${format(monday, 'MMM d', { locale })} – ${format(end, 'MMM d, yyyy', { locale })}`;
  }
  return `${format(monday, 'MMM d, yyyy', { locale })} – ${format(end, 'MMM d, yyyy', { locale })}`;
}

const FC_LOCALES: Record<string, () => Promise<{ default: unknown }>> = {
  uk: () => import('@fullcalendar/core/locales/uk'),
};

export async function getFullCalendarLocale(): Promise<unknown | undefined> {
  const lang = i18n.language;
  const loader = FC_LOCALES[lang];
  if (!loader) return undefined; // English is FC default
  const mod = await loader();
  return mod.default;
}
