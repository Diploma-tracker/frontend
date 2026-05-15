/**
 * ThesisDefensePanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active'.
 */
import { useEffectOnce } from 'react-use';

import { TextFormField } from '@/shared/components';
import { reatomForm } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { z } from 'zod';

import type { ThesisDataDTO } from '@repo/api';
import { Button } from '@repo/ui-kit/components/common/data-display/button';

import {
  type Stage,
  ThesisRole,
  sendProcessEvent,
} from '../../../models/bachelor-thesis-process';
import {
  ActionButtons,
  ActionDialog,
  ActionsSection,
  DataItem,
  StageDescription,
} from './common';

interface ThesisDefensePanelProps {
  processId: string;
  stage: Stage;
  data: ThesisDataDTO | null;
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
  const { fields, submit } = thesisDefenseForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Виставити оцінку</Button>}
        title="Результат захисту"
        submitLabel="Виставити оцінку та завершити"
        onSubmit={submit}
      >
        <TextFormField
          placeholder={'Введіть оцінку (0–100)...'}
          label={'Оцінка (0–100)'}
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
  processId,
  stage,
  data,
}: ThesisDefensePanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Фінальний захист дипломної роботи перед комісією. Керівник виставляє оцінку."
        responsible="Керівник / Комісія"
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label="Оцінка"
          value={
            data?.grade !== null && data?.grade !== undefined
              ? String(data.grade)
              : '—'
          }
        />
        <DataItem label="Літера" value={data?.gradeLetter ?? '—'} />
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
