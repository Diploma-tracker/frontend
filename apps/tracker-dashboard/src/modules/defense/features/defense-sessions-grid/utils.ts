import { add } from 'date-fns';

import { parseDuration } from '@repo/utils/duration';

import type { DefenseSessionDTO, PendingDragReschedule } from '../../models';

export interface DefenseSessionCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  classNames: string[];
  extendedProps: {
    session: DefenseSessionDTO;
  };
}

export function sessionsToCalendarEvents(
  sessions: DefenseSessionDTO[],
  pending: PendingDragReschedule | null,
  getTitle: (session: DefenseSessionDTO) => string,
): DefenseSessionCalendarEvent[] {
  return sessions.map((session) => {
    let startRaw = session.date;
    let durationRaw = session.duration;
    if (pending && pending.sessionId === session.id) {
      startRaw = pending.newDate;
      durationRaw = pending.newDuration ?? session.duration;
    }

    const start = new Date(startRaw);
    const end = add(start, parseDuration(durationRaw));

    return {
      id: session.id,
      title: getTitle(session),
      start: start,
      end: end,
      classNames: ['fc-event--primary'],
      extendedProps: { session },
    };
  });
}
