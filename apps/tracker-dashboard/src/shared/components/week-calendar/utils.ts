import { format } from 'date-fns';

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
  const end = getWeekEnd(monday, view);
  if (monday.getMonth() === end.getMonth()) {
    return `${format(monday, 'MMM d')} – ${format(end, 'd, yyyy')}`;
  }
  if (monday.getFullYear() === end.getFullYear()) {
    return `${format(monday, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(monday, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}
