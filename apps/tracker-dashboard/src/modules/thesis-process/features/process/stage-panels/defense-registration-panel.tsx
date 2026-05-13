/**
 * DefenseRegistrationPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { router } from '@/app/config/router';
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

const STATE_LABELS: Record<string, string> = {
  student_register_defense: 'Студент обирає сесію захисту',
  registered: 'Зареєстровано на захист',
};

interface DefenseRegistrationPanelProps {
  stage: Stage;
}

const OpenCalendarAction = ({ roundId }: { roundId: string }) => {
  const handleOpenCalendar = () => {
    router.navigate({ to: '/defense/$roundId', params: { roundId } });
  };

  return (
    <ActionButtons>
      <Button onClick={handleOpenCalendar}>Відкрити календар</Button>
    </ActionButtons>
  );
};

export const DefenseRegistrationPanel = reatomComponent(
  function DefenseRegistrationPanel({ stage }: DefenseRegistrationPanelProps) {
    const thesis = thesisData();
    if (!thesis) return null;
    const { allocationRoundId: roundId } = thesis;

    return (
      <div className="flex flex-col gap-4">
        <StageDescription
          description="Студент записується на одну з доступних сесій захисту дипломної роботи."
          responsible="Студент"
          stateLabel={
            stage.state ? (STATE_LABELS[stage.state] ?? stage.state) : null
          }
        />

        <div className="flex flex-col gap-2">
          <DataItem label="Сесія захисту" value="—" />
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
