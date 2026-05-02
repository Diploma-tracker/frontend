import { parse, serialize, type Duration } from "tinyduration";

export type { Duration };

/**
 * Normalizes a duration object so that overflow in each unit is carried up.
 * e.g. { minutes: 90 } → { hours: 1, minutes: 30 }
 */
export function normalizeDuration(duration: Duration): Duration {
  const { years = 0, months = 0, weeks = 0 } = duration;
  let {
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = duration;

  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds %= 60;
  }
  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes %= 60;
  }
  if (hours >= 24) {
    days += Math.floor(hours / 24);
    hours %= 24;
  }

  return { years, months, weeks, days, hours, minutes, seconds };
}

/**
 * Parses an ISO 8601 duration string into a Duration object.
 *
 * @example
 * parseDuration('PT1H30M') // { hours: 1, minutes: 30 }
 * parseDuration('PT5400S') // { seconds: 5400 }
 */
export function parseDuration(iso: string): Duration {
  if (!iso) return {};
  return normalizeDuration(parse(iso));
}

/**
 * Serializes a Duration object to an ISO 8601 duration string.
 *
 * @example
 * serializeDuration({ hours: 1, minutes: 30 }) // 'PT1H30M'
 */
export function serializeDuration(duration: Duration): string {
  const cleaned: Duration = Object.fromEntries(
    Object.entries(duration).filter(([, v]) => v !== undefined && v !== 0),
  ) as Duration;
  if (Object.keys(cleaned).length === 0) return "PT0S";
  return serialize(cleaned);
}

/**
 * Converts the duration between two dates into an ISO 8601 duration string.
 *
 * @example
 * intervalToISODuration(new Date('2024-01-01T10:00:00'), new Date('2024-01-01T11:30:00')) // 'PT1H30M'
 */
export function intervalToISODuration(start: Date, end: Date): string {
  const totalSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
  if (totalSeconds === 0) return "PT0S";
  return serializeDuration(normalizeDuration({ seconds: totalSeconds }));
}
