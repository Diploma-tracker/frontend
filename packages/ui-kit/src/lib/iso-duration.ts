import { parseDuration, serializeDuration } from '@repo/utils/duration';

/**
 * Parses an ISO 8601 duration string into hours and minutes components.
 *
 * @example
 * parseISODurationComponents('PT1H30M') // { hours: 1, minutes: 30 }
 * parseISODurationComponents('PT45M')   // { hours: 0, minutes: 45 }
 */
export function parseISODurationComponents(iso: string): {
  hours: number;
  minutes: number;
} {
  if (!iso) return { hours: 0, minutes: 0 };
  const { hours = 0, minutes = 0 } = parseDuration(iso);
  return { hours, minutes };
}

/**
 * Formats hours and minutes into an ISO 8601 duration string.
 *
 * @example
 * formatISODuration(1, 30) // 'PT1H30M'
 * formatISODuration(0, 45) // 'PT45M'
 * formatISODuration(2, 0)  // 'PT2H'
 */
export function formatISODuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return 'PT0M';
  return serializeDuration({ hours, minutes });
}
