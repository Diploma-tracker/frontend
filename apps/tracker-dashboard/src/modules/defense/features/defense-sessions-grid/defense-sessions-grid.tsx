import { DefenseSessionDetailDialog, defenseSessionDialogAtom } from '@/modules/defense';
import { ScheduleEventContent, WeekCalendar } from '@/shared/components/week-calendar';
import { useTranslation } from '@/shared/utils/i18n';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';

import type { DefenseSessionDTO } from '../../models';
import { sessionsToCalendarEvents } from './utils';

interface DefenseSessionsGridProps {
  sessions: DefenseSessionDTO[];
  isLoading?: boolean;
  error?: string | null;
  onDateClick?: (date: Date) => void;
  onEventChange?: () => void;
  onEventDelete?: () => void;
}

export function DefenseSessionsGrid({
  sessions,
  isLoading,
  error,
  onDateClick,
  onEventChange,
  onEventDelete,
}: DefenseSessionsGridProps) {
  const { t } = useTranslation();

  const events = sessionsToCalendarEvents(sessions, (session) =>
    t('defense.session.title', {
      capacity: session.capacity,
      participants: session.participantCount,
    })
  );

  const handleDateClick = onDateClick ? (arg: DateClickArg) => onDateClick(arg.date) : undefined;

  const openDetailDialog = (session: { id: string }) => {
    defenseSessionDialogAtom.set({
      sessionId: session.id,
      open: true,
      isRegistered: false,
      onDeleted: onEventChange,
      onUpdated: onEventDelete,
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const session = arg.event.extendedProps?.session as DefenseSessionDTO | undefined;
    if (session) openDetailDialog(session);
  };

  return (
    <>
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
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={(eventInfo: EventContentArg) => <ScheduleEventContent eventInfo={eventInfo} />}
          />
        </div>
      </WeekCalendar.Root>
      <DefenseSessionDetailDialog />
    </>
  );
}
