import { useQuery } from '@/shared/model/query';
import { reatomComponent } from '@reatom/react';

import { defenseSessionDetailsQuery } from '../../models';
import { parseDuration } from '../defense-sessions-grid/utils';

function formatDuration(isoDuration: string): string {
  const ms = parseDuration(isoDuration);
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MainContent = reatomComponent(function MainContent({ sessionId }: { sessionId: string }) {
  const { data } = useQuery(defenseSessionDetailsQuery, sessionId);
  const session = data();

  if (!session) return null;

  const participantCount = session.participants?.length ?? 0;
  const endDate = new Date(new Date(session.date).getTime() + parseDuration(session.duration));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Start</p>
          <p className="font-medium">{formatDateTime(session.date)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">End</p>
          <p className="font-medium">{formatDateTime(endDate.toISOString())}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="font-medium">{formatDuration(session.duration)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Capacity</p>
          <p className="font-medium">
            {participantCount} / {session.capacity}
          </p>
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center gap-3 rounded-lg border p-4 text-sm text-muted-foreground sm:flex">
        More content comming soon...
      </div>
    </div>
  );
}, 'MainContent');
