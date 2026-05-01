import type { EventContentArg } from '@fullcalendar/core';
import { format } from 'date-fns';

type Props = {
  eventInfo: EventContentArg;
};

export const COLOR_VAR_MAP: Record<string, { bg: string; text: string; bar: string }> = {
  'fc-event--primary': { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
  'fc-event--chart-2': {
    bg: 'bg-[color-mix(in_srgb,var(--chart-2)_12%,transparent)]',
    text: 'text-[var(--chart-2)]',
    bar: 'bg-[var(--chart-2)]',
  },
  'fc-event--chart-3': {
    bg: 'bg-[color-mix(in_srgb,var(--chart-3)_12%,transparent)]',
    text: 'text-[var(--chart-3)]',
    bar: 'bg-[var(--chart-3)]',
  },
  'fc-event--chart-4': {
    bg: 'bg-[color-mix(in_srgb,var(--chart-4)_15%,transparent)]',
    text: 'text-[var(--chart-4)]',
    bar: 'bg-[var(--chart-4)]',
  },
  'fc-event--chart-5': {
    bg: 'bg-[color-mix(in_srgb,var(--chart-5)_12%,transparent)]',
    text: 'text-[var(--chart-5)]',
    bar: 'bg-[var(--chart-5)]',
  },
} as const;

export const FALLBACK = { bg: 'bg-secondary', text: 'text-foreground', bar: 'bg-muted-foreground' } as const;

export function ScheduleEventContent({ eventInfo }: Props) {
  const { event } = eventInfo;

  const colorKey = (event.classNames as string[]).find((c) => c in COLOR_VAR_MAP) ?? '';
  const colors = COLOR_VAR_MAP[colorKey] ?? FALLBACK;

  const start = event.start ? format(event.start, 'HH:mm') : '';
  const end = event.end ? format(event.end, 'HH:mm') : '';

  // Compact single-line rendering for very short slots (< 45 min)
  const durationMs = event.end && event.start ? event.end.getTime() - event.start.getTime() : 0;
  const isCompact = durationMs > 0 && durationMs < 45 * 60 * 1000;

  if (isCompact) {
    return (
      <div className={`fc-event-custom fc-event-custom--compact ${colors.bg} ${colors.text}`}>
        <span className={`fc-event-custom__bar ${colors.bar}`} />
        <span className="fc-event-custom__title truncate font-medium">{event.title}</span>
        <span className="fc-event-custom__time ml-auto shrink-0 opacity-70">{start}</span>
      </div>
    );
  }

  return (
    <div className={`fc-event-custom ${colors.bg} ${colors.text}`}>
      <span className={`fc-event-custom__bar ${colors.bar}`} />
      <div className="fc-event-custom__body">
        <span className="fc-event-custom__title leading-tight font-semibold">{event.title}</span>
        <span className="fc-event-custom__time text-xs opacity-70">
          {start} – {end}
        </span>
      </div>
    </div>
  );
}
