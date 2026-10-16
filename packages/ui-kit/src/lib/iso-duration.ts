import { parseDuration, serializeDuration } from '@repo/utils/duration';

/**
 * Parses an ISO 8601 duration string into day, hour and minute components.
 *
 * @example
 * parseISODurationComponents('P1DT2H30M') // { days: 1, hours: 2, minutes: 30 }
 * parseISODurationComponents('PT45M')     // { days: 0, hours: 0, minutes: 45 }
 */
export function parseISODurationComponents(iso: string): {
  days: number;
  hours: number;
  minutes: number;
} {
  if (!iso) return { days: 0, hours: 0, minutes: 0 };
  const { days = 0, hours = 0, minutes = 0 } = parseDuration(iso);
  return { days, hours, minutes };
}

/**
 * Formats day, hour and minute components into an ISO 8601 duration string.
 *
 * @example
 * formatISODuration(1, 30)    // 'PT1H30M'
 * formatISODuration(0, 45)    // 'PT45M'
 * formatISODuration(2, 0)     // 'PT2H'
 * formatISODuration(0, 0, 1)  // 'P1D'
 */
export function formatISODuration(
  hours: number,
  minutes: number,
  days = 0,
): string {
  if (days === 0 && hours === 0 && minutes === 0) return 'PT0M';
  return serializeDuration({ days, hours, minutes });
}
