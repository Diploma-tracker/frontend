/**
 * PlagiarismPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { reatomField, reatomForm } from '@reatom/core';
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
  ConfirmationModal,
  DataItem,
  FileInputField,
  FileLink,
  StageDescription,
} from './common';

const STATE_LABELS: Record<string, string> = {
  plagiarism_supervisor_check: 'Перевірка керівником антиплагіату',
  student_reupload_thesis: 'Студент виправляє та повторно завантажує',
};

interface PlagiarismPanelProps {
  processId: string;
  stage: Stage;
  data: ThesisDataDTO | null;
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

const approvePlagiarismSchema = z.object({
  processId: z.string().min(1),
  plagiarismReport: z.instanceof(File),
});

// eslint-disable-next-line react-refresh/only-export-components
export const approvePlagiarismForm = reatomForm(
  {
    processId: '',
    plagiarismReport: reatomField<File | null>(null),
  },
  {
    schema: approvePlagiarismSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'APPROVE_PLAGIARISM_CHECK',
          plagiarismReport: values.plagiarismReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'approvePlagiarismForm',
  },
);

const fixPlagiarismSchema = z
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
export const fixPlagiarismIssuesForm = reatomForm(
  {
    processId: '',
    thesisMaterialsArchive: reatomField<File | null>(null),
    thesisReport: reatomField<File | null>(null),
  },
  {
    schema: fixPlagiarismSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'FIX_PLAGIARISM_ISSUES',
          thesisMaterialsArchive: values.thesisMaterialsArchive,
          thesisReport: values.thesisReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'fixPlagiarismIssuesForm',
  },
);

// ---------------------------------------------------------------------------
// Action sub-components
// ---------------------------------------------------------------------------

const PlagiarismSupervisorCheckAction = ({
  processId,
}: {
  processId: string;
}) => {
  const { fields, submit } = approvePlagiarismForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Затвердити (з звітом)</Button>}
        title="Затвердження перевірки антиплагіату"
        submitLabel="Затвердити"
        onSubmit={submit}
      >
        <FileInputField
          label="Звіт антиплагіату"
          accept=".pdf"
          field={fields.plagiarismReport}
          description="Необхідний для затвердження"
        />
      </ActionDialog>
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            Відхилити
          </Button>
        }
        title="Відхилити перевірку?"
        description="Студент отримає завдання виправити роботу."
        confirmLabel="Відхилити"
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'REJECT_PLAGIARISM_CHECK' },
          })
        }
      />
    </ActionButtons>
  );
};

const ReuploadThesisAction = ({ processId }: { processId: string }) => {
  const { fields, submit } = fixPlagiarismIssuesForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Повторно завантажити</Button>}
        title="Виправлення та повторне завантаження"
        submitLabel="Надіслати повторно"
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

export const PlagiarismPanel = reatomComponent(function PlagiarismPanel({
  processId,
  stage,
  data,
}: PlagiarismPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Перевірка дипломної роботи на плагіат. Відповідальний завантажує звіт антиплагіату."
        responsible="Керівник антиплагіату → Студент (при відхиленні)"
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
        <DataItem
          label="Звіт антиплагіату"
          value={
            data?.plagiarismReport ? (
              <FileLink
                processId={processId}
                fileId={data.plagiarismReport.fileId}
                label={`v${data.plagiarismReport.version}`}
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
            name: 'plagiarism_supervisor_check',
            isActive: (state) => state === 'plagiarism_supervisor_check',
            role: ThesisRole.plagiarism_supervisor,
            component: (
              <PlagiarismSupervisorCheckAction processId={processId} />
            ),
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
