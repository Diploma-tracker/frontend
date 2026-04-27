import type { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import { useWeekCalendar } from './context';

type WeekCalendarGridProps = Omit<
  CalendarOptions,
  // managed internally by the compound component
  'ref' | 'plugins' | 'initialView' | 'headerToolbar' | 'weekends'
>;

export function WeekCalendarGrid(props: WeekCalendarGridProps) {
  const { calendarRef, weekView } = useWeekCalendar();

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={false}
      weekends={weekView === 'full'}
      allDaySlot={false}
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      height="700px"
      scrollTime={`${new Date().getHours().toString().padStart(2, '0')}:00:00`}
      nowIndicator
      {...props}
    />
  );
}
