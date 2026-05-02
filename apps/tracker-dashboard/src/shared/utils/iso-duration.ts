import { formatDuration } from 'date-fns';
import { parse, serialize } from 'tinyduration';

import { getLocale } from './locale';

/**
 * Parses an ISO 8601 duration string into milliseconds.
 *
 * @example
 * parseISODuration('PT1H30M') // 5400000
 * parseISODuration('PT45M')   // 2700000
 * parseISODuration('PT5400S') // 5400000
 */
export function parseISODuration(iso: string): number {
  if (!iso) return 0;
  const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = parse(iso);
  return (
    years * 365 * 24 * 3600 * 1000 +
    months * 30 * 24 * 3600 * 1000 +
    weeks * 7 * 24 * 3600 * 1000 +
    days * 24 * 3600 * 1000 +
    hours * 3600 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000
  );
}

/**
 * Converts a time interval to an ISO 8601 duration string.
 *
 * @example
 * intervalToISODuration(new Date('2024-01-01T10:00:00'), new Date('2024-01-01T11:30:00')) // 'PT1H30M'
 */
export function intervalToISODuration(start: Date, end: Date): string {
  const totalSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
  if (totalSeconds === 0) return 'PT0S';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return serialize({ hours: hours || undefined, minutes: minutes || undefined, seconds: seconds || undefined });
}

/**
 * Formats hours and minutes into an ISO 8601 duration string.
 *
 * @example
 * formatISODuration(1, 30) // 'PT1H30M'
 * formatISODuration(0, 45) // 'PT45M'
 */
export function formatISODuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return 'PT0M';
  return serialize({ hours: hours || undefined, minutes: minutes || undefined });
}

/**
 * Formats an ISO 8601 duration string to a localized human-readable string.
 *
 * @example
 * formatDurationToReadable('PT1H30M') // '1 hour 30 minutes'
 * formatDurationToReadable('PT45M')   // '45 minutes'
 */
export function formatDurationToReadable(isoDuration: string): string {
  if (!isoDuration) return '';
  const { years, months, weeks, days, hours, minutes, seconds } = parse(isoDuration);
  const locale = getLocale();
  return formatDuration({ years, months, weeks, days, hours, minutes, seconds }, { locale });
}
