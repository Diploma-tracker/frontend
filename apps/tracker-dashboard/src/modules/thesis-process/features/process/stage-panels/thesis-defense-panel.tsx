/**
 * ThesisDefensePanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active'.
 */
import { useEffectOnce } from 'react-use';

import { TextFormField } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomForm } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { z } from 'zod';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import {
  type Stage,
  ThesisRole,
  bachalorThesisProcessId,
  sendProcessEvent,
  thesisData,
} from '../../../models/bachelor-thesis-process';
import {
  ActionButtons,
  ActionDialog,
  ActionsSection,
  DataItem,
  StageDescription,
} from './common';

interface ThesisDefensePanelProps {
  stage: Stage;
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

const thesisDefenseSchema = z.object({
  processId: z.string().min(1),
  grade: z.coerce.number().int().min(0).max(100),
});

// eslint-disable-next-line react-refresh/only-export-components
export const thesisDefenseForm = reatomForm(
  { processId: '', grade: '' },
  {
    schema: thesisDefenseSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'THESIS_DEFENSE',
          grade: values.grade,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'thesisDefenseForm',
  },
);

// ---------------------------------------------------------------------------
// Action sub-components
// ---------------------------------------------------------------------------

const DefenseGradeAction = reatomComponent(function DefenseGradeAction({
  processId,
}: {
  processId: string;
}) {
  const { t } = useTranslation();
  const { fields, submit } = thesisDefenseForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">
            {t('thesisProcess.thesisDefense.assignGradeButton')}
          </Button>
        }
        title={t('thesisProcess.thesisDefense.dialogTitle')}
        submitLabel={t('thesisProcess.thesisDefense.submitLabel')}
        onSubmit={submit}
      >
        <TextFormField
          placeholder={t('thesisProcess.thesisDefense.gradePlaceholder')}
          label={t('thesisProcess.thesisDefense.gradeFieldLabel')}
          type={'number'}
          min={0}
          max={100}
          field={fields.grade}
        />
      </ActionDialog>
    </ActionButtons>
  );
});

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export const ThesisDefensePanel = reatomComponent(function ThesisDefensePanel({
  stage,
}: ThesisDefensePanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.thesisDefense.description')}
        responsible={t('thesisProcess.thesisDefense.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.thesisDefense.gradeLabel')}
          value={
            data?.grade !== null && data?.grade !== undefined
              ? String(data.grade)
              : '—'
          }
        />
        <DataItem
          label={t('thesisProcess.thesisDefense.gradeLetterLabel')}
          value={data?.gradeLetter ?? '—'}
        />
      </div>

      <ActionsSection
        status={stage.status}
        state={stage.state}
        actions={[
          {
            name: 'defense_grade',
            isActive: (state) => state === 'supervisor_add_grade',
            role: ThesisRole.supervisor,
            component: <DefenseGradeAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
