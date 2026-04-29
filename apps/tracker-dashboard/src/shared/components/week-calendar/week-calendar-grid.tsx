import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CalendarOptions, LocaleSingularArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { WarningIcon } from '@phosphor-icons/react';

import { Spinner } from '@repo/ui-kit/components/common/states/spinner';
import { cn } from '@repo/ui-kit/lib/utils';

import { useWeekCalendar } from './context';
import { getFullCalendarLocale } from './utils';

type WeekCalendarGridProps = Omit<
  CalendarOptions,
  // managed internally by the compound component
  'ref' | 'plugins' | 'initialView' | 'headerToolbar' | 'weekends' | 'locale'
> & {
  isLoading?: boolean;
  error?: string | null;
  editable?: boolean;
};

export function WeekCalendarGrid({ isLoading, error, editable = true, ...props }: WeekCalendarGridProps) {
  const { calendarRef, weekView, setIsInteractive } = useWeekCalendar();
  const { i18n } = useTranslation();
  const [fcLocale, setFcLocale] = useState<LocaleSingularArg | undefined>(undefined);

  const isBlocked = !!isLoading || !!error;

  useEffect(() => {
    setIsInteractive(!isBlocked);
  }, [isBlocked, setIsInteractive]);

  useEffect(() => {
    getFullCalendarLocale().then((locale) => setFcLocale(locale as LocaleSingularArg | undefined));
  }, [i18n.language]);

  return (
    <div className={cn('relative h-full overflow-auto', { 'overflow-hidden': isBlocked })}>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        weekends={weekView === 'full'}
        allDaySlot={false}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        scrollTime={`${new Date().getHours().toString().padStart(2, '0')}:00:00`}
        nowIndicator
        editable={editable && !isBlocked}
        selectable={editable && !isBlocked}
        locale={fcLocale}
        {...props}
      />

      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[2px]">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      )}

      {!isLoading && error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-background/60 backdrop-blur-[2px]">
          <WarningIcon className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
