import { useEffect } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { roundDefenseSessionsAtom } from '../../models';
import type { DefenseSessionDTO } from '../../models';
import { DefenseSessionsGrid } from '../defense-sessions-grid';

interface RoundDefenseSessionsProps {
  roundId: string;
  onDateClick?: (date: Date) => void;
  onEventClick?: (session: DefenseSessionDTO) => void;
}

export const RoundDefenseSessions = reatomComponent(function RoundDefenseSessions({
  roundId,
  onDateClick,
  onEventClick,
}: RoundDefenseSessionsProps) {
  const { t } = useTranslation();
  const status = roundDefenseSessionsAtom.status();
  const sessions = roundDefenseSessionsAtom.data() ?? [];

  useEffect(() => {
    wrap(roundDefenseSessionsAtom(roundId));
  }, [roundId]);

  return (
    <DefenseSessionsGrid
      sessions={sessions}
      isLoading={status.isPending}
      error={status.isRejected ? t('defense.error') : null}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
    />
  );
}, 'RoundDefenseSessions');
