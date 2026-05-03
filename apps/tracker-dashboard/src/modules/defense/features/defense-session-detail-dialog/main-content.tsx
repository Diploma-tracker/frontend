import { useQuery } from '@/shared/model/query';
import { formatDateTime } from '@/shared/utils/format-date';
import { useTranslation } from '@/shared/utils/i18n';
import { formatDurationToReadable } from '@/shared/utils/iso-duration';
import { reatomComponent } from '@reatom/react';
import { add } from 'date-fns';

import { parseDuration } from '@repo/utils/duration';

import { defenseSessionDetailsQuery } from '../../models';

export const MainContent = reatomComponent(function MainContent({
  sessionId,
}: {
  sessionId: string;
}) {
  const { t } = useTranslation();
  const { data } = useQuery(defenseSessionDetailsQuery, sessionId);
  const session = data();

  if (!session) return null;

  const participantCount = session.participants?.length ?? 0;

  const endDate = add(new Date(session.date), parseDuration(session.duration));

  const renderCell = (label: string, value: string | number | null) => (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
        {renderCell(
          t('defense.session.detail.dateLabel'),
          formatDateTime(session.date),
        )}
        {renderCell(
          t('defense.session.detail.endLabel'),
          formatDateTime(endDate.toISOString()),
        )}
        {renderCell(
          t('defense.session.detail.durationLabel'),
          formatDurationToReadable(session.duration),
        )}
        {renderCell(
          t('defense.session.detail.capacityLabel'),
          `${participantCount} / ${session.capacity}`,
        )}
      </div>
      <div className="hidden flex-1 items-center justify-center gap-3 rounded-lg border p-4 text-sm text-muted-foreground sm:flex">
        {t('defense.session.detail.contentPlaceholder')}
      </div>
    </div>
  );
}, 'MainContent');
