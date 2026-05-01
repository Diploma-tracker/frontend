import { formatDuration, intervalToDuration, type Duration } from 'date-fns';

import { getLocale } from './locale';

/**
 * Normalizes a duration object to handle overflow.
 * For example, 90 minutes becomes 1 hour 30 minutes, 3600 seconds becomes 1 hour.
 *
 * @param duration - Raw duration object
 * @returns Normalized duration object
 */
function normalizeDuration(duration: Duration): Duration {
  const { years = 0, months = 0, weeks = 0, days: inputDays = 0 } = duration;
  let { hours = 0, minutes = 0, seconds = 0 } = duration;
  let days = inputDays;

  // Normalize seconds to minutes
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds = seconds % 60;
  }

  // Normalize minutes to hours
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  // Normalize hours to days
  if (hours >= 24) {
    days += Math.floor(hours / 24);
    hours = hours % 24;
  }

  return {
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
  };
}

/**
 * Parses an ISO 8601 duration string into duration components.
 * Automatically normalizes overflow (e.g., 90 minutes becomes 1 hour 30 minutes).
 *
 * @param iso - ISO 8601 duration string
 * @returns Normalized Duration object with hours, minutes, and seconds
 *
 * @example
 * parseISODurationComponents('PT1H30M') // { hours: 1, minutes: 30, seconds: 0 }
 * parseISODurationComponents('PT45M')   // { hours: 0, minutes: 45, seconds: 0 }
 * parseISODurationComponents('PT5400S') // { hours: 1, minutes: 30, seconds: 0 } (normalized!)
 * parseISODurationComponents('PT90M')   // { hours: 1, minutes: 30, seconds: 0 } (normalized!)
 */
export function parseISODurationComponents(iso: string): Duration {
  if (!iso) return { hours: 0, minutes: 0, seconds: 0 };
  const h = iso.match(/(\d+)H/);
  const m = iso.match(/(\d+)M/);
  const s = iso.match(/(\d+)S/);

  const rawDuration: Duration = {
    hours: h ? parseInt(h[1]!, 10) : 0,
    minutes: m ? parseInt(m[1]!, 10) : 0,
    seconds: s ? parseInt(s[1]!, 10) : 0,
  };

  // Normalize to handle overflow (e.g., 90 minutes -> 1 hour 30 minutes)
  return normalizeDuration(rawDuration);
}

/**
 * Parses an ISO 8601 duration string (e.g. "PT1H30M", "PT45M") into milliseconds.
 * Supports hours (H), minutes (M), and seconds (S) components.
 *
 * @param iso - ISO 8601 duration string
 * @returns Duration in milliseconds
 *
 * @example
 * parseISODuration('PT1H30M') // 5400000 (90 minutes in ms)
 * parseISODuration('PT45M')   // 2700000 (45 minutes in ms)
 * parseISODuration('PT2H')    // 7200000 (2 hours in ms)
 * parseISODuration('PT5400S') // 5400000 (90 minutes in ms)
 */
export function parseISODuration(iso: string): number {
  const { hours = 0, minutes = 0, seconds = 0 } = parseISODurationComponents(iso);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Converts a time interval to ISO 8601 duration format (e.g., "PT1H30M", "PT45M").
 *
 * @param start - The start date of the interval
 * @param end - The end date of the interval
 * @returns ISO 8601 duration string
 *
 * @example
 * const start = new Date('2024-01-01T10:00:00');
 * const end = new Date('2024-01-01T11:30:00');
 * intervalToISODuration(start, end) // 'PT1H30M'
 */
export function intervalToISODuration(start: Date, end: Date): string {
  const duration = intervalToDuration({ start, end });
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;

  if (hours === 0 && minutes === 0) {
    return 'PT0S';
  }

  return `PT${hours > 0 ? `${hours}H` : ''}${minutes > 0 ? `${minutes}M` : ''}`;
}

/**
 * Formats hours and minutes into an ISO 8601 duration string.
 *
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns ISO 8601 duration string
 *
 * @example
 * formatISODuration(1, 30) // 'PT1H30M'
 * formatISODuration(0, 45) // 'PT45M'
 * formatISODuration(2, 0)  // 'PT2H'
 */
export function formatISODuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return 'PT0M';
  const h = hours > 0 ? `${hours}H` : '';
  const m = minutes > 0 ? `${minutes}M` : '';
  return `PT${h}${m}`;
}

/**
 * Formats an ISO 8601 duration string to a human-readable format with i18n support.
 * Uses the current i18n locale from the app.
 *
 * @param isoDuration - ISO 8601 duration string
 * @returns Localized human-readable duration string
 *
 * @example
 * // With English locale:
 * formatDurationToReadable('PT1H30M') // '1 hour 30 minutes'
 * formatDurationToReadable('PT45M')   // '45 minutes'
 * formatDurationToReadable('PT2H')    // '2 hours'
 * formatDurationToReadable('PT5400S') // '1 hour 30 minutes'
 *
 * // With Ukrainian locale:
 * formatDurationToReadable('PT1H30M') // '1 година 30 хвилин'
 * formatDurationToReadable('PT45M')   // '45 хвилин'
 * formatDurationToReadable('PT2H')    // '2 години'
 */
export function formatDurationToReadable(isoDuration: string): string {
  const components = parseISODurationComponents(isoDuration);
  const locale = getLocale();
  return formatDuration(components, { locale });
}
