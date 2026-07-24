import { type DayButtonProps } from 'react-day-picker';

import { getLocale } from '@/shared/utils/format-date';
import { useTranslation } from '@/shared/utils/i18n';
import { isWithinInterval, startOfDay } from 'date-fns';

import { Calendar, CalendarDayButton } from '@repo/ui-kit/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui-kit/components/common/floating/popover';
import { CardTitle } from '@repo/ui-kit/components/common/layout/card';

import { type Event, useWeekCalendar } from './context';

function getEventCountsForDay(events: Event[], day: Date) {
  let count = 0;
  const targetDay = startOfDay(day);

  for (const event of events) {
    const eventStart = event.start ? startOfDay(event.start) : targetDay;
    const eventEnd = event.end ? startOfDay(event.end) : targetDay;

    const is_event = isWithinInterval(targetDay, {
      start: eventStart,
      end: eventEnd,
    });

    if (is_event) {
      count++;
    }
  }

  return count;
}

function EventCountDayButton({
  day,
  modifiers,
  children,
  ...props
}: DayButtonProps) {
  const { events } = useWeekCalendar();
  const count = getEventCountsForDay(events, day.date);

  return (
    <CalendarDayButton day={day} modifiers={modifiers} {...props}>
      {children}
      {count > 0 && <span>{count}</span>}
    </CalendarDayButton>
  );
}

export function WeekCalendarTitle() {
  const { t } = useTranslation();
  const {
    title,
    weekRange,
    pickerOpen,
    setPickerOpen,
    setWeekRange,
    handleDayClick,
    isInteractive,
  } = useWeekCalendar();

  const locale = getLocale();

  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <button
          className="-mx-1 cursor-pointer rounded px-1 text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label={t('schedule.pickWeek')}
          disabled={!isInteractive}
        >
          <CardTitle className="underline-offset-4 hover:underline">
            {title}
          </CardTitle>
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-auto p-0">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 5, 0)}
          endMonth={new Date(new Date().getFullYear() + 5, 11)}
          month={weekRange.from}
          onMonthChange={(m) => setWeekRange({ ...weekRange, from: m })}
          selected={weekRange}
          onDayClick={handleDayClick}
          weekStartsOn={1}
          showOutsideDays
          locale={locale}
          components={{ DayButton: EventCountDayButton }}
        />
      </PopoverContent>
    </Popover>
  );
}
