import { getCapitalsFromStrings } from '@/shared/utils/get-capitals-from-strings';
import { describe, expect, it } from 'vitest';

describe('getCapitalsFromStrings', () => {
  it('combines the uppercase first character of each string', () => {
    expect(getCapitalsFromStrings('john', 'doe', 'smith')).toBe('JDS');
  });

  it('preserves characters that are already uppercase', () => {
    expect(getCapitalsFromStrings('John', 'DOE')).toBe('JD');
  });

  it('skips empty strings', () => {
    expect(getCapitalsFromStrings('', 'john', '', 'doe')).toBe('JD');
  });

  it('returns an empty string when no strings are provided', () => {
    expect(getCapitalsFromStrings()).toBe('');
  });

  it('supports non-Latin characters', () => {
    expect(getCapitalsFromStrings('іван', 'петренко')).toBe('ІП');
  });
});
