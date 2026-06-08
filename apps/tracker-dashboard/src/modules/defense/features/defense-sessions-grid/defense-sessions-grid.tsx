import { permissions } from '@/modules/auth';
import {
  DefenseSessionDetailDialog,
  defenseSessionDialogAtom,
} from '@/modules/defense';
import { userAtom } from '@/modules/user';
import { ConfirmationModal } from '@/shared/components/confirmation-modal/confirmation-modal';
import {
  ScheduleEventContent,
  WeekCalendar,
} from '@/shared/components/week-calendar';
import { formatDateTime } from '@/shared/utils/format-date';
import { useTranslation } from '@/shared/utils/i18n';
import type {
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core';
import type {
  DateClickArg,
  EventResizeDoneArg,
} from '@fullcalendar/interaction';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { intervalToISODuration } from '@repo/utils/duration';

import type { DefenseSessionDTO } from '../../models';
import {
  pendingDragRescheduleAtom,
  rescheduleDefenseSessionAction,
} from '../../models/defense-session-actions-model';
import { sessionsToCalendarEvents } from './utils';

interface DefenseSessionsGridProps {
  sessions: DefenseSessionDTO[];
  isLoading?: boolean;
  error?: string | null;
  onDateClick?: (date: Date) => void;
  onEventChange?: () => void;
  onEventDelete?: () => void;
}

export const DefenseSessionsGrid = reatomComponent(
  function DefenseSessionsGrid({
    sessions,
    isLoading,
    error,
    onDateClick,
    onEventChange,
    onEventDelete,
  }: DefenseSessionsGridProps) {
    const { t } = useTranslation();
    const user = userAtom();
    const isAdmin = permissions.isAdmin(user);

    const pending = pendingDragRescheduleAtom();
    const isRescheduling = rescheduleDefenseSessionAction.status().isPending;

    const events = sessionsToCalendarEvents(sessions, pending, (session) =>
      t('defense.session.title', {
        capacity: session.capacity,
        participants: session.participantCount,
      }),
    );

    const handleDateClick = onDateClick
      ? (arg: DateClickArg) => onDateClick(arg.date)
      : undefined;

    const openDetailDialog = (session: { id: string }) => {
      defenseSessionDialogAtom.set({
        sessionId: session.id,
        open: true,
        isRegistered: false,
        onDeleted: onEventDelete,
        onUpdated: onEventChange,
      });
    };

    const handleEventClick = (arg: EventClickArg) => {
      const session = arg.event.extendedProps?.session as
        | DefenseSessionDTO
        | undefined;
      if (session) openDetailDialog(session);
    };

    const handleEventDrop = (arg: EventDropArg) => {
      const session = arg.event.extendedProps?.session as
        | DefenseSessionDTO
        | undefined;
      if (!session || !arg.event.start) {
        arg.revert();
        return;
      }
      pendingDragRescheduleAtom.set({
        sessionId: session.id,
        newDate: arg.event.start.toISOString(),
        revert: arg.revert,
      });
    };

    const handleEventResize = (arg: EventResizeDoneArg) => {
      const session = arg.event.extendedProps?.session as
        | DefenseSessionDTO
        | undefined;
      if (!session || !arg.event.start || !arg.event.end) {
        arg.revert();
        return;
      }
      const isoDuration = intervalToISODuration(arg.event.start, arg.event.end);
      pendingDragRescheduleAtom.set({
        sessionId: session.id,
        newDate: arg.event.start.toISOString(),
        newDuration: isoDuration,
        revert: arg.revert,
      });
    };

    const handleConfirmReschedule = async () => {
      if (!pending) return;
      try {
        await wrap(
          rescheduleDefenseSessionAction({
            sessionId: pending.sessionId,
            date: pending.newDate,
            duration: pending.newDuration ?? null,
          }),
        );
        pendingDragRescheduleAtom.set(null);
        onEventChange?.();
      } catch {
        pending.revert();
        pendingDragRescheduleAtom.set(null);
      }
    };

    const handleRescheduleModalClose = (open: boolean) => {
      if (open) return;
      pending?.revert();
      pendingDragRescheduleAtom.set(null);
    };

    return (
      <>
        <WeekCalendar.Root events={events}>
          <div className="flex h-full flex-col gap-4 overflow-hidden p-0">
            <div className="flex shrink-0 items-center justify-between">
              <WeekCalendar.Navigation />
              <WeekCalendar.Title />
              <WeekCalendar.ViewToggle />
            </div>
            <WeekCalendar.Grid
              editable={isAdmin}
              height="auto"
              isLoading={isLoading}
              error={error}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={isAdmin ? handleEventDrop : undefined}
              eventResize={isAdmin ? handleEventResize : undefined}
              eventContent={(eventInfo: EventContentArg) => (
                <ScheduleEventContent eventInfo={eventInfo} />
              )}
            />
          </div>
        </WeekCalendar.Root>

        <DefenseSessionDetailDialog />

        <ConfirmationModal
          open={!!pending}
          onOpenChange={handleRescheduleModalClose}
          title={t('defense.session.reschedule.confirmTitle')}
          description={t('defense.session.reschedule.confirmDescription', {
            date: pending ? (formatDateTime(pending.newDate) ?? '') : '',
          })}
          confirmLabel={t('defense.session.reschedule.confirmButton')}
          isPending={isRescheduling}
          onConfirm={handleConfirmReschedule}
        />
      </>
    );
  },
  'DefenseSessionsGrid',
);
