import i18n from '@/app/config/i18n';
import { formatDate, formatDateTime } from '@/shared/utils/format-date';
import { formatDurationToReadable } from '@/shared/utils/iso-duration';
import { getLocale } from '@/shared/utils/locale';
import { enUS, uk } from 'date-fns/locale';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(async () => {
  await i18n.changeLanguage('en');
});

describe('getLocale', () => {
  it('returns the English locale for English', async () => {
    await i18n.changeLanguage('en');

    expect(getLocale()).toBe(enUS);
  });

  it('returns the Ukrainian locale for Ukrainian', async () => {
    await i18n.changeLanguage('uk');

    expect(getLocale()).toBe(uk);
  });

  it('falls back to English for an unsupported language', async () => {
    await i18n.changeLanguage('fr');

    expect(getLocale()).toBe(enUS);
  });
});

describe('date formatting', () => {
  it.each([null, undefined, ''])('returns null for an empty value', (value) => {
    expect(formatDate(value)).toBeNull();
    expect(formatDateTime(value)).toBeNull();
  });

  it('formats dates and times in English', async () => {
    await i18n.changeLanguage('en');

    expect(formatDate('2024-01-15T14:30:00')).toBe('15 Jan 2024');
    expect(formatDateTime('2024-01-15T14:30:00')).toBe('15 Jan 2024, 14:30');
  });

  it('formats dates and times in Ukrainian', async () => {
    await i18n.changeLanguage('uk');

    expect(formatDate('2024-01-15T14:30:00')).toBe('15 січ. 2024');
    expect(formatDateTime('2024-01-15T14:30:00')).toBe('15 січ. 2024, 14:30');
  });
});

describe('formatDurationToReadable', () => {
  it('formats and normalizes an ISO duration in English', async () => {
    await i18n.changeLanguage('en');

    expect(formatDurationToReadable('PT5400S')).toBe('1 hour 30 minutes');
  });

  it('formats an ISO duration in Ukrainian', async () => {
    await i18n.changeLanguage('uk');

    expect(formatDurationToReadable('PT1H30M')).toBe('1 годину 30 хвилин');
  });
});
