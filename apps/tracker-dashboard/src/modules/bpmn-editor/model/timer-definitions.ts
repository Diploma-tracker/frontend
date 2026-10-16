import { parseDuration, serializeDuration } from '@repo/utils/duration';

import type { TimerType } from './event-definitions';

export interface DurationComponents {
  days: number;
  hours: number;
  minutes: number;
}

export const EMPTY_DURATION: DurationComponents = {
  days: 0,
  hours: 0,
  minutes: 0,
};

export function parseDurationComponents(raw: string): DurationComponents {
  if (!raw) return { ...EMPTY_DURATION };

  try {
    const { days = 0, hours = 0, minutes = 0 } = parseDuration(raw);
    return { days, hours, minutes };
  } catch {
    return { ...EMPTY_DURATION };
  }
}

export function serializeDurationComponents(c: DurationComponents): string {
  if (!c.days && !c.hours && !c.minutes) return 'PT0S';
  return serializeDuration({
    days: c.days,
    hours: c.hours,
    minutes: c.minutes,
  });
}

export interface CycleComponents {
  /** Finite repeat count, or null when unspecified. */
  repeat: number | null;
  /** `true` for `R` (repeat forever). */
  infinite: boolean;
  /** Optional ISO start date/time between the prefix and the interval. */
  start?: string;
  duration: DurationComponents;
}

export const EMPTY_CYCLE: CycleComponents = {
  repeat: null,
  infinite: true,
  duration: { ...EMPTY_DURATION },
};

const REPEAT_PATTERN = /^R(\d*)$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;

/**
 * Rough check for a Quartz-style cron expression (5–7 space-separated fields),
 * which Flowable also accepts for `timeCycle`.
 */
export function isCronExpression(raw: string): boolean {
  const fields = raw.trim().split(/\s+/).filter(Boolean);
  return fields.length >= 5 && fields.length <= 7;
}

/** Timer input modes surfaced in the editor. */
export type TimerMode = 'relative' | 'absolute' | 'cycle' | 'cron' | 'iso';

/** Detects which mode best describes a stored timer type + value. */
export function detectTimerMode(
  type: TimerType | null,
  raw: string,
): TimerMode {
  if (type === 'date') return 'absolute';
  if (type === 'duration') return 'relative';
  if (type === 'cycle') return isCronExpression(raw) ? 'cron' : 'cycle';
  return 'relative';
}

/**
 * Auto-detects the BPMN timer field a raw value belongs to, used by the ISO mode.
 * Returns null when the value matches no known shape.
 */
export function detectTimerField(raw: string): TimerType | null {
  const value = raw.trim();
  if (!value) return null;

  if (isCronExpression(value)) return 'cycle';
  if (DATE_PATTERN.test(value)) return 'date';

  const head = value.split('/')[0]?.trim() ?? '';
  if (REPEAT_PATTERN.test(head)) return 'cycle';

  try {
    parseDuration(value);
    return 'duration';
  } catch {
    return null;
  }
}

export function parseCycle(raw: string): CycleComponents {
  if (!raw) return { ...EMPTY_CYCLE, duration: { ...EMPTY_DURATION } };

  const segments = raw.split('/');
  const match = REPEAT_PATTERN.exec(segments[0]?.trim() ?? '');
  const count = match?.[1] ?? '';

  const infinite = match ? count === '' : true;
  const repeat = match && count !== '' ? Number.parseInt(count, 10) : null;
  const rest = segments.slice(1);
  const durationRaw = rest.length > 0 ? (rest[rest.length - 1] ?? '') : '';
  const start = rest.length > 1 ? rest.slice(0, -1).join('/') : undefined;

  return {
    repeat,
    infinite,
    start,
    duration: parseDurationComponents(durationRaw),
  };
}

export function serializeCycle(c: CycleComponents): string {
  const prefix = c.infinite || c.repeat == null ? 'R' : `R${c.repeat}`;
  const startPart = c.start ? `${c.start}/` : '';
  return `${prefix}/${startPart}${serializeDurationComponents(c.duration)}`;
}

export const TIMER_PRESETS: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'm5', value: 'PT5M' },
  { key: 'm15', value: 'PT15M' },
  { key: 'h1', value: 'PT1H' },
  { key: 'd1', value: 'P1D' },
];

/**
 * Best-effort validation of a raw ISO timer value for the escape hatch.
 */
export function isValidTimerValue(type: TimerType, raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;

  if (type === 'date') {
    return !Number.isNaN(new Date(value).getTime());
  }

  if (type === 'cycle') {
    if (isCronExpression(value)) return true;

    const [prefix, ...rest] = value.split('/');
    if (!REPEAT_PATTERN.test(prefix?.trim() ?? '') || rest.length === 0) {
      return false;
    }

    try {
      parseDuration(rest[rest.length - 1] ?? '');
      return true;
    } catch {
      return false;
    }
  }

  try {
    parseDuration(value);
    return true;
  } catch {
    return false;
  }
}
