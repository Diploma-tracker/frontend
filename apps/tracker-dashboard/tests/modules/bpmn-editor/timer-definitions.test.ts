import {
  EMPTY_DURATION,
  detectTimerField,
  detectTimerMode,
  isCronExpression,
  isValidTimerValue,
  parseCycle,
  parseDurationComponents,
  serializeCycle,
  serializeDurationComponents,
} from '@/modules/bpmn-editor';
import { describe, expect, it } from 'vitest';

describe('parseDurationComponents', () => {
  it('parses days, hours and minutes', () => {
    expect(parseDurationComponents('P1DT2H30M')).toEqual({
      days: 1,
      hours: 2,
      minutes: 30,
    });
  });

  it('normalizes hours into days', () => {
    expect(parseDurationComponents('PT25H')).toEqual({
      days: 1,
      hours: 1,
      minutes: 0,
    });
  });

  it('returns zeroed components for empty or invalid input', () => {
    expect(parseDurationComponents('')).toEqual(EMPTY_DURATION);
    expect(parseDurationComponents('not-a-duration')).toEqual(EMPTY_DURATION);
  });
});

describe('serializeDurationComponents', () => {
  it('serializes component values to ISO 8601', () => {
    expect(
      serializeDurationComponents({ days: 1, hours: 2, minutes: 30 }),
    ).toBe('P1DT2H30M');
    expect(serializeDurationComponents({ days: 1, hours: 0, minutes: 0 })).toBe(
      'P1D',
    );
    expect(serializeDurationComponents({ days: 0, hours: 0, minutes: 5 })).toBe(
      'PT5M',
    );
  });

  it('returns PT0S for an all-zero duration', () => {
    expect(serializeDurationComponents(EMPTY_DURATION)).toBe('PT0S');
  });

  it('round-trips a duration without changing existing values', () => {
    expect(serializeDurationComponents(parseDurationComponents('PT5M'))).toBe(
      'PT5M',
    );
    expect(
      serializeDurationComponents(parseDurationComponents('P1DT2H30M')),
    ).toBe('P1DT2H30M');
  });
});

describe('parseCycle', () => {
  it('parses a finite repeat count with an interval', () => {
    expect(parseCycle('R3/PT10H')).toEqual({
      repeat: 3,
      infinite: false,
      start: undefined,
      duration: { days: 0, hours: 10, minutes: 0 },
    });
  });

  it('treats a bare R as infinite', () => {
    expect(parseCycle('R/P1D')).toMatchObject({
      repeat: null,
      infinite: true,
      duration: { days: 1, hours: 0, minutes: 0 },
    });
  });

  it('preserves an ISO start date segment', () => {
    expect(parseCycle('R3/2024-01-01T00:00:00Z/PT10H')).toMatchObject({
      repeat: 3,
      infinite: false,
      start: '2024-01-01T00:00:00Z',
      duration: { days: 0, hours: 10, minutes: 0 },
    });
  });
});

describe('serializeCycle', () => {
  it('serializes a finite cycle', () => {
    expect(
      serializeCycle({
        repeat: 3,
        infinite: false,
        duration: { days: 0, hours: 10, minutes: 0 },
      }),
    ).toBe('R3/PT10H');
  });

  it('serializes an infinite cycle', () => {
    expect(
      serializeCycle({
        repeat: null,
        infinite: true,
        duration: { days: 1, hours: 0, minutes: 0 },
      }),
    ).toBe('R/P1D');
  });

  it('round-trips a cycle that includes a start date', () => {
    const raw = 'R3/2024-01-01T00:00:00Z/PT10H';
    expect(serializeCycle(parseCycle(raw))).toBe(raw);
  });
});

describe('isValidTimerValue', () => {
  it('validates durations', () => {
    expect(isValidTimerValue('duration', 'PT5M')).toBe(true);
    expect(isValidTimerValue('duration', 'not-a-duration')).toBe(false);
  });

  it('validates cycles', () => {
    expect(isValidTimerValue('cycle', 'R3/PT10H')).toBe(true);
    expect(isValidTimerValue('cycle', 'R/P1D')).toBe(true);
    expect(isValidTimerValue('cycle', 'PT10H')).toBe(false);
  });

  it('accepts cron expressions on cycles', () => {
    expect(isValidTimerValue('cycle', '0 0 9 ? * MON-FRI')).toBe(true);
  });

  it('validates dates', () => {
    expect(isValidTimerValue('date', '2024-01-01T00:00:00.000Z')).toBe(true);
    expect(isValidTimerValue('date', 'not-a-date')).toBe(false);
  });
});

describe('isCronExpression', () => {
  it('accepts 5 to 7 whitespace-separated fields', () => {
    expect(isCronExpression('0 0 9 ? * MON-FRI')).toBe(true);
    expect(isCronExpression('* * * * *')).toBe(true);
  });

  it('rejects durations, dates and prose', () => {
    expect(isCronExpression('PT5M')).toBe(false);
    expect(isCronExpression('R3/PT10H')).toBe(false);
    expect(isCronExpression('2024-01-01')).toBe(false);
    expect(isCronExpression('')).toBe(false);
  });
});

describe('detectTimerField', () => {
  it('maps raw values to their BPMN timer field', () => {
    expect(detectTimerField('PT5M')).toBe('duration');
    expect(detectTimerField('P1DT2H')).toBe('duration');
    expect(detectTimerField('2024-01-01T09:00:00Z')).toBe('date');
    expect(detectTimerField('R3/PT10H')).toBe('cycle');
    expect(detectTimerField('0 0 9 ? * MON-FRI')).toBe('cycle');
  });

  it('returns null for empty or unrecognized values', () => {
    expect(detectTimerField('')).toBeNull();
    expect(detectTimerField('not-a-timer')).toBeNull();
  });
});

describe('detectTimerMode', () => {
  it('derives the editing mode from type and value', () => {
    expect(detectTimerMode(null, '')).toBe('relative');
    expect(detectTimerMode('duration', 'PT5M')).toBe('relative');
    expect(detectTimerMode('date', '2024-01-01T09:00:00Z')).toBe('absolute');
    expect(detectTimerMode('cycle', 'R3/PT10H')).toBe('cycle');
    expect(detectTimerMode('cycle', '0 0 9 ? * MON-FRI')).toBe('cron');
  });
});
