/**
 * DefenseRegistrationPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { router } from '@/app/config/router';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import {
  type Stage,
  ThesisRole,
  thesisData,
} from '../../../models/bachelor-thesis-process';
import {
  ActionButtons,
  ActionsSection,
  DataItem,
  StageDescription,
} from './common';

interface DefenseRegistrationPanelProps {
  stage: Stage;
}

const OpenCalendarAction = ({ roundId }: { roundId: string }) => {
  const { t } = useTranslation();
  const handleOpenCalendar = () => {
    router.navigate({ to: '/defense/$roundId', params: { roundId } });
  };

  return (
    <ActionButtons>
      <Button onClick={handleOpenCalendar}>
        {t('thesisProcess.defenseRegistration.openCalendarButton')}
      </Button>
    </ActionButtons>
  );
};

export const DefenseRegistrationPanel = reatomComponent(
  function DefenseRegistrationPanel({ stage }: DefenseRegistrationPanelProps) {
    const { t } = useTranslation();
    const thesis = thesisData();
    if (!thesis) return null;
    const { allocationRoundId: roundId } = thesis;

    return (
      <div className="flex flex-col gap-4">
        <StageDescription
          description={t('thesisProcess.defenseRegistration.description')}
          responsible={t('thesisProcess.defenseRegistration.responsible')}
        />

        <div className="flex flex-col gap-2">
          <DataItem
            label={t('thesisProcess.defenseRegistration.sessionLabel')}
            value="—"
          />
        </div>

        <ActionsSection
          status={stage.status}
          state={stage.state}
          actions={[
            {
              name: 'open_calendar',
              isActive: (state) =>
                state === 'student_register_defense' || state === 'registered',
              role: ThesisRole.student,
              component: <OpenCalendarAction roundId={roundId} />,
            },
          ]}
        />
      </div>
    );
  },
);
