/**
 * PreDefensePanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { FileInputField } from '@/shared/components/form/file-form-field';
import { reatomField, reatomForm } from '@reatom/core';
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
  ConfirmationModal,
  DataItem,
  FileLink,
  StageDescription,
} from './common';

const STATE_LABELS: Record<string, string> = {
  commission_review: 'На розгляді комісії',
  student_reupload_thesis: 'Студент виправляє зауваження',
};

interface PreDefensePanelProps {
  stage: Stage;
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

const fixPreDefenseSchema = z
  .object({
    processId: z.string().min(1),
    thesisMaterialsArchive: z.instanceof(File).nullable(),
    thesisReport: z.instanceof(File).nullable(),
  })
  .refine((values) => values.thesisMaterialsArchive || values.thesisReport, {
    message: 'Потрібно завантажити хоча б один файл',
    path: ['thesisMaterialsArchive', 'thesisReport'],
  });

// eslint-disable-next-line react-refresh/only-export-components
export const fixPreDefenseIssuesForm = reatomForm(
  {
    processId: '',
    thesisMaterialsArchive: reatomField<File | null>(null),
    thesisReport: reatomField<File | null>(null),
  },
  {
    schema: fixPreDefenseSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'FIX_PRE_DEFENSE_ISSUES',
          thesisMaterialsArchive: values.thesisMaterialsArchive,
          thesisReport: values.thesisReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'fixPreDefenseIssuesForm',
  },
);

// ---------------------------------------------------------------------------
// Action sub-components
// ---------------------------------------------------------------------------

const CommissionReviewAction = ({ processId }: { processId: string }) => (
  <ActionButtons>
    <ConfirmationModal
      trigger={<Button size="sm">Допустити до захисту</Button>}
      title="Допустити до захисту?"
      description="Студент буде допущений до фінального захисту."
      confirmLabel="Допустити"
      onConfirm={() =>
        sendProcessEvent({ processId, event: { name: 'APPROVE_PRE_DEFENSE' } })
      }
    />
    <ConfirmationModal
      trigger={
        <Button size="sm" variant="outline">
          Відхилити
        </Button>
      }
      title="Відхилити матеріали?"
      description="Студент отримає завдання виправити зауваження."
      confirmLabel="Відхилити"
      onConfirm={() =>
        sendProcessEvent({ processId, event: { name: 'REJECT_PRE_DEFENSE' } })
      }
    />
  </ActionButtons>
);

const ReuploadThesisAction = ({ processId }: { processId: string }) => {
  const { fields, submit } = fixPreDefenseIssuesForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Виправити та надіслати</Button>}
        title="Виправлення зауважень комісії"
        submitLabel="Надіслати на повторний розгляд"
        onSubmit={submit}
      >
        <FileInputField
          label="Архів матеріалів (виправлений)"
          accept=".zip,.rar,.7z"
          field={fields.thesisMaterialsArchive}
        />
        <FileInputField
          label="Звіт (виправлений)"
          accept=".pdf,.doc,.docx"
          field={fields.thesisReport}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export const PreDefensePanel = reatomComponent(function PreDefensePanel({
  stage,
}: PreDefensePanelProps) {
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Комісія розглядає матеріали дипломної роботи та приймає рішення про допуск до захисту."
        responsible="Член комісії → Студент (при відхиленні)"
        stateLabel={
          stage.state ? (STATE_LABELS[stage.state] ?? stage.state) : null
        }
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label="Архів матеріалів"
          value={
            data?.thesisArchive ? (
              <FileLink
                processId={processId}
                fileId={data.thesisArchive.fileId}
                label={`v${data.thesisArchive.version}`}
              />
            ) : (
              '—'
            )
          }
        />
        <DataItem
          label="Звіт"
          value={
            data?.thesisReport ? (
              <FileLink
                processId={processId}
                fileId={data.thesisReport.fileId}
                label={`v${data.thesisReport.version}`}
              />
            ) : (
              '—'
            )
          }
        />
      </div>

      <ActionsSection
        status={stage.status}
        state={stage.state}
        actions={[
          {
            name: 'commission_review',
            isActive: (state) => state === 'commission_review',
            role: ThesisRole.commission_member,
            component: <CommissionReviewAction processId={processId} />,
          },
          {
            name: 'student_reupload_thesis',
            isActive: (state) => state === 'student_reupload_thesis',
            role: ThesisRole.student,
            component: <ReuploadThesisAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
