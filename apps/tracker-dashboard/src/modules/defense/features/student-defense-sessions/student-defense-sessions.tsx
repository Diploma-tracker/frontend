import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { studentDefenseSessionsAtom } from '../../models';
import { DefenseSessionsGrid } from '../defense-sessions-grid';

export const StudentDefenseSessions = reatomComponent(function StudentDefenseSessions() {
  const { t } = useTranslation();
  const status = studentDefenseSessionsAtom.status();
  const sessions = studentDefenseSessionsAtom.data() ?? [];

  useEffect(() => {
    wrap(studentDefenseSessionsAtom());
  }, []);

  return (
    <DefenseSessionsGrid
      sessions={sessions}
      isLoading={status.isPending}
      error={status.isRejected ? t('defense.error') : null}
    />
  );
}, 'StudentDefenseSessions');
