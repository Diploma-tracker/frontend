import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '@/layouts';
import type { EventContentArg, EventDropArg } from '@fullcalendar/core';

import { ScheduleEventContent } from './schedule-event-content';
import './schedule.css';
import { WeekCalendar } from './week-calendar';

// ── helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekDate(mondayDate: Date, dayOffset: number, time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number];
  const d = new Date(mondayDate);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// ── mock data ─────────────────────────────────────────────────────────────────

type MockEventDef = {
  id: string;
  titleKey: string;
  days: number[]; // 1=Mon … 7=Sun
  startTime: string;
  endTime: string;
  colorClass: string;
};

const MOCK_EVENT_DEFS: MockEventDef[] = [
  {
    id: '1',
    titleKey: 'schedule.events.mathLecture',
    days: [1],
    startTime: '09:00',
    endTime: '10:30',
    colorClass: 'fc-event--chart-2',
  },
  {
    id: '2',
    titleKey: 'schedule.events.physicsLab',
    days: [2],
    startTime: '11:00',
    endTime: '13:00',
    colorClass: 'fc-event--chart-4',
  },
  {
    id: '3',
    titleKey: 'schedule.events.csSeminar',
    days: [3],
    startTime: '14:00',
    endTime: '15:30',
    colorClass: 'fc-event--chart-3',
  },
  {
    id: '4',
    titleKey: 'schedule.events.englishWriting',
    days: [4],
    startTime: '10:00',
    endTime: '11:30',
    colorClass: 'fc-event--chart-5',
  },
  {
    id: '5',
    titleKey: 'schedule.events.projectMeeting',
    days: [5],
    startTime: '13:00',
    endTime: '14:00',
    colorClass: 'fc-event--primary',
  },
  {
    id: '6',
    titleKey: 'schedule.events.algorithmsLecture',
    days: [1, 3],
    startTime: '16:00',
    endTime: '17:30',
    colorClass: 'fc-event--chart-2',
  },
  {
    id: '7',
    titleKey: 'schedule.events.databaseSystems',
    days: [2, 4],
    startTime: '08:00',
    endTime: '09:30',
    colorClass: 'fc-event--chart-4',
  },
  {
    id: '8',
    titleKey: 'schedule.events.weekendWorkshop',
    days: [6],
    startTime: '10:00',
    endTime: '12:00',
    colorClass: 'fc-event--chart-3',
  },
];

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  classNames: string[];
};

function buildEvents(defs: MockEventDef[], monday: Date, t: (k: string) => string): CalendarEvent[] {
  return defs.flatMap((def) =>
    def.days.map((day) => ({
      id: `${def.id}-${day}`,
      title: t(def.titleKey),
      start: weekDate(monday, day - 1, def.startTime),
      end: weekDate(monday, day - 1, def.endTime),
      classNames: [def.colorClass],
    }))
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export const SchedulePage = () => {
  const { t } = useTranslation();

  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    buildEvents(MOCK_EVENT_DEFS, getMondayOfWeek(new Date()), t)
  );

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start: event.startStr, end: event.endStr } : e)));
  };

  return (
    <PageLayout>
      <WeekCalendar.Root>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <WeekCalendar.Navigation />
            <WeekCalendar.Title />
            <WeekCalendar.ViewToggle />
          </div>

          <WeekCalendar.Grid
            events={events}
            editable
            eventDrop={handleEventDrop}
            eventContent={(eventInfo: EventContentArg) => <ScheduleEventContent eventInfo={eventInfo} />}
          />
        </div>
      </WeekCalendar.Root>
    </PageLayout>
  );
};
