import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { roundDefenseSessionsAtom } from '../../models';
import { DefenseSessionsGrid } from '../defense-sessions-grid';

interface RoundDefenseSessionsProps {
  roundId: string;
  onDateClick?: (date: Date) => void;
}

export const RoundDefenseSessions = reatomComponent(function RoundDefenseSessions({
  roundId,
  onDateClick,
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
    />
  );
}, 'RoundDefenseSessions');
