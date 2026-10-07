import {
  calculatePercentage,
  formatPercentageString,
} from '@/shared/utils/percentage';
import { describe, expect, it } from 'vitest';

describe('calculatePercentage', () => {
  it('calculates the percentage of a total', () => {
    expect(calculatePercentage(25, 200)).toBe(12.5);
  });

  it('returns zero when the total is zero', () => {
    expect(calculatePercentage(25, 0)).toBe(0);
  });

  it('rounds the result to the requested number of decimal places', () => {
    expect(calculatePercentage(1, 6, 2)).toBe(16.67);
    expect(calculatePercentage(1, 6, 0)).toBe(17);
  });

  it('supports negative values', () => {
    expect(calculatePercentage(-1, 4)).toBe(-25);
  });
});

describe('formatPercentageString', () => {
  it('formats a percentage value with no decimal places by default', () => {
    const expected = new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0.125);

    expect(formatPercentageString(12.5)).toBe(expected);
  });

  it('formats a percentage value with the requested decimal places', () => {
    const expected = new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0.1234);

    expect(formatPercentageString(12.34, 2)).toBe(expected);
  });

  it('formats negative percentage values', () => {
    const expected = new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(-0.075);

    expect(formatPercentageString(-7.5, 1)).toBe(expected);
  });
});
