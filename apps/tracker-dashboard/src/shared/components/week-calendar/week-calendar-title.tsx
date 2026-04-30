import { getLocale } from '@/shared/utils/format-date';
import { useTranslation } from '@/shared/utils/i18n';

import { Calendar } from '@repo/ui-kit/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-kit/components/common/floating/popover';
import { CardTitle } from '@repo/ui-kit/components/common/layout/card';

import { useWeekCalendar } from './context';

export function WeekCalendarTitle() {
  const { t, i18n } = useTranslation();
  const { title, weekRange, pickerOpen, setPickerOpen, setWeekRange, handleDayClick, isInteractive } =
    useWeekCalendar();

  // Re-evaluate on language change
  void i18n.language;
  const locale = getLocale();

  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <button
          className="-mx-1 cursor-pointer rounded px-1 text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label={t('schedule.pickWeek')}
          disabled={!isInteractive}
        >
          <CardTitle className="underline-offset-4 hover:underline">{title}</CardTitle>
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
        />
      </PopoverContent>
    </Popover>
  );
}
