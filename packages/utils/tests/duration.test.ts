import {
  intervalToISODuration,
  normalizeDuration,
  parseDuration,
  serializeDuration,
} from '../src/duration';
import { describe, expect, it } from 'vitest';

describe('normalizeDuration', () => {
  it.each([
    {
      name: 'carries overflowing time units into larger units',
      input: {
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 25,
        minutes: 61,
        seconds: 61,
      },
      expected: {
        years: 1,
        months: 2,
        weeks: 3,
        days: 5,
        hours: 2,
        minutes: 2,
        seconds: 1,
      },
    },
    {
      name: 'defaults omitted units to zero',
      input: {},
      expected: {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeDuration(input)).toEqual(expected);
  });
});

describe('parseDuration', () => {
  it.each([
    {
      name: 'parses an ISO 8601 duration',
      input: 'P1Y2M3W4DT5H6M7S',
      expected: {
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
      },
    },
    {
      name: 'normalizes overflowing parsed units',
      input: 'PT90061S',
      expected: {
        years: 0,
        months: 0,
        weeks: 0,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
      },
    },
    {
      name: 'returns an empty duration for an empty string',
      input: '',
      expected: {},
    },
  ])('$name', ({ input, expected }) => {
    expect(parseDuration(input)).toEqual(expected);
  });

  it.each([['not-a-duration'], ['hello'], ['123']])(
    'throws for invalid duration "%s"',
    (input) => {
      expect(() => parseDuration(input)).toThrow('Invalid duration');
    },
  );
});

describe('serializeDuration', () => {
  it.each([
    {
      name: 'serializes a duration to ISO 8601',
      input: {
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
      },
      expected: 'P1Y2M3W4DT5H6M7S',
    },
    {
      name: 'omits zero and undefined units',
      input: {
        hours: 1,
        minutes: 0,
        seconds: undefined,
      },
      expected: 'PT1H',
    },
    {
      name: 'serializes an empty duration as zero seconds',
      input: {},
      expected: 'PT0S',
    },
    {
      name: 'serializes zero-valued duration as zero seconds',
      input: {
        hours: 0,
        minutes: 0,
      },
      expected: 'PT0S',
    },
  ])('$name', ({ input, expected }) => {
    expect(serializeDuration(input)).toBe(expected);
  });
});

describe('intervalToISODuration', () => {
  it.each([
    {
      name: 'serializes the duration between two dates',
      start: '2024-01-01T10:00:00.000Z',
      end: '2024-01-02T11:30:15.000Z',
      expected: 'P1DT1H30M15S',
    },
    {
      name: 'rounds the interval to the nearest second',
      start: '2024-01-01T10:00:00.000Z',
      end: '2024-01-01T10:00:01.500Z',
      expected: 'PT2S',
    },
    {
      name: 'serializes equal dates as zero seconds',
      start: '2024-01-01T10:00:00.000Z',
      end: '2024-01-01T10:00:00.000Z',
      expected: 'PT0S',
    },
  ])('$name', ({ start, end, expected }) => {
    expect(intervalToISODuration(new Date(start), new Date(end))).toBe(
      expected,
    );
  });
});
