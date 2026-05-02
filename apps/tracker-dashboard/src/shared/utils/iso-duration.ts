import { formatDuration } from 'date-fns';

import { parseDuration, normalizeDuration } from '@repo/utils/duration';

import { getLocale } from './locale';

/**
 * Formats an ISO 8601 duration string to a localized human-readable string.
 *
 * @example
 * formatDurationToReadable('PT1H30M') // '1 hour 30 minutes'
 * formatDurationToReadable('PT45M')   // '45 minutes'
 */
export function formatDurationToReadable(isoDuration: string): string {
  const duration = normalizeDuration(parseDuration(isoDuration));
  return formatDuration(duration, { locale: getLocale() });
}
