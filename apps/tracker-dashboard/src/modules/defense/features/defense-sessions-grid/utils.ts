import type { DefenseSessionDTO, PendingDragReschedule } from '../../models';

/**
 * Parses an ISO 8601 duration string (e.g. "PT1H30M", "PT45M") into milliseconds.
 */
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export interface DefenseSessionCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  classNames: string[];
  extendedProps: {
    session: DefenseSessionDTO;
  };
}

export function sessionsToCalendarEvents(
  sessions: DefenseSessionDTO[],
  pending: PendingDragReschedule | null,
  getTitle: (session: DefenseSessionDTO) => string
): DefenseSessionCalendarEvent[] {
  return sessions.map((session) => {
    let startRaw = session.date;
    let durationRaw = session.duration;
    if (pending && pending.sessionId === session.id) {
      startRaw = pending.newDate;
      durationRaw = pending.newDuration ?? session.duration;
    }

    const start = new Date(startRaw);
    const durationMs = parseDuration(durationRaw);
    const end = new Date(start.getTime() + durationMs);

    return {
      id: session.id,
      title: getTitle(session),
      start: start.toISOString(),
      end: end.toISOString(),
      classNames: ['fc-event--primary'],
      extendedProps: { session },
    };
  });
}
