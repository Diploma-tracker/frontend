import { useTranslation } from 'react-i18next';

import { ScheduleEventContent, WeekCalendar } from '@/shared/components/week-calendar';
import type { EventContentArg } from '@fullcalendar/core';

import type { DefenseSessionDTO } from '../../models';
import { sessionsToCalendarEvents } from './utils';

interface DefenseSessionsGridProps {
  sessions: DefenseSessionDTO[];
  isLoading?: boolean;
  error?: string | null;
}

export function DefenseSessionsGrid({ sessions, isLoading, error }: DefenseSessionsGridProps) {
  const { t } = useTranslation();

  const events = sessionsToCalendarEvents(sessions, (session) =>
    t('defense.session.title', {
      capacity: session.capacity,
      participants: session.participantCount,
    })
  );

  return (
    <WeekCalendar.Root>
      <div className="flex h-full flex-col gap-4 overflow-hidden p-0">
        <div className="flex shrink-0 items-center justify-between">
          <WeekCalendar.Navigation />
          <WeekCalendar.Title />
          <WeekCalendar.ViewToggle />
        </div>

        <WeekCalendar.Grid
          editable={false}
          height="auto"
          events={events}
          isLoading={isLoading}
          error={error}
          eventContent={(eventInfo: EventContentArg) => <ScheduleEventContent eventInfo={eventInfo} />}
        />
      </div>
    </WeekCalendar.Root>
  );
}
