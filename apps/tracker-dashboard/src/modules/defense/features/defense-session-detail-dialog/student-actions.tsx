import { userAtom } from '@/modules/user';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { UserCheckIcon, UserMinusIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Spinner } from '@repo/ui-kit/components/common/states/spinner';

import {
  defenseSessionDetailsQuery,
  isStudentRegisteredForSession,
  registerForDefenseSessionAction,
  unregisterFromDefenseSessionAction,
} from '../../models/defense-session-actions-model';
import { defenseSessionDialogAtom } from './dialog-state';

export const StudentActions = reatomComponent(function StudentActions() {
  const { t } = useTranslation();
  const { onUpdated, sessionId } = defenseSessionDialogAtom();
  const { data, revalidate } = useQuery(defenseSessionDetailsQuery, sessionId ?? '');
  const user = userAtom();
  const session = data();

  const isRegistered = isStudentRegisteredForSession(session, user.id);

  const isRegistering = registerForDefenseSessionAction.status().isPending;
  const isUnregistering = unregisterFromDefenseSessionAction.status().isPending;

  const participants = session?.participants ?? [];
  const isFull = session ? participants.length >= session.capacity : false;

  const handleRegister = () => {
    if (!sessionId) return;
    wrap(registerForDefenseSessionAction(sessionId)).then(() => {
      onUpdated?.();
      revalidate();
    });
  };

  const handleUnregister = () => {
    if (!sessionId) return;
    wrap(unregisterFromDefenseSessionAction(sessionId)).then(() => {
      onUpdated?.();
      revalidate();
    });
  };

  if (isRegistered) {
    return (
      <Button variant="outline" intent="destructive" onClick={handleUnregister} disabled={isUnregistering}>
        {isUnregistering ? (
          <Spinner />
        ) : (
          <>
            <UserMinusIcon className="size-4" />
            {t('defense.session.detail.unregisterButton')}
          </>
        )}
      </Button>
    );
  }

  return (
    <Button onClick={handleRegister} disabled={isRegistering || !session || isFull}>
      {isRegistering ? (
        <Spinner />
      ) : (
        <>
          <UserCheckIcon className="size-4" />
          {t('defense.session.detail.registerButton')}
        </>
      )}
    </Button>
  );
}, 'StudentActions');
