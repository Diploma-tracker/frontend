/**
 * DesignPanel
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
  student_upload_thesis: 'Студент завантажує матеріали',
  supervisor_review_thesis: 'На перевірці керівника',
};

interface DesignPanelProps {
  stage: Stage;
}

const uploadThesisSchema = z.object({
  processId: z.string().min(1),
  thesisMaterialsArchive: z.instanceof(File),
  thesisReport: z.instanceof(File),
});

// eslint-disable-next-line react-refresh/only-export-components
export const uploadThesisMaterialsForm = reatomForm(
  {
    processId: '',
    thesisMaterialsArchive: reatomField<File | null>(null),
    thesisReport: reatomField<File | null>(null),
  },
  {
    schema: uploadThesisSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'UPLOAD_THESIS_MATERIALS',
          thesisMaterialsArchive: values.thesisMaterialsArchive,
          thesisReport: values.thesisReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'uploadThesisMaterialsForm',
  },
);

const UploadMaterialsAction = ({ processId }: { processId: string }) => {
  const { fields, submit } = uploadThesisMaterialsForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Завантажити матеріали</Button>}
        title="Завантаження матеріалів проєктування"
        submitLabel="Надіслати на перевірку"
        onSubmit={submit}
      >
        <FileInputField
          label="Архів матеріалів дипломної роботи"
          accept=".zip,.rar,.7z"
          field={fields.thesisMaterialsArchive}
        />
        <FileInputField
          label="Звіт"
          accept=".pdf,.doc,.docx"
          field={fields.thesisReport}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

const SupervisorReviewAction = ({ processId }: { processId: string }) => (
  <ActionButtons>
    <ConfirmationModal
      trigger={<Button size="sm">Затвердити</Button>}
      title="Затвердити матеріали?"
      description="Ви підтверджуєте, що матеріали відповідають вимогам."
      confirmLabel="Затвердити"
      onConfirm={() =>
        sendProcessEvent({
          processId,
          event: { name: 'APPROVE_THESIS_MATERIALS' },
        })
      }
    />
    <ConfirmationModal
      trigger={
        <Button size="sm" variant="outline">
          Відхилити
        </Button>
      }
      title="Відхилити матеріали?"
      description="Студент отримає завдання виправити та повторно завантажити."
      confirmLabel="Відхилити"
      onConfirm={() =>
        sendProcessEvent({
          processId,
          event: { name: 'REJECT_THESIS_MATERIALS' },
        })
      }
    />
  </ActionButtons>
);

export const DesignPanel = reatomComponent(function DesignPanel({
  stage,
}: DesignPanelProps) {
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Студент завантажує архів матеріалів та звіт дипломної роботи для перевірки керівником."
        responsible="Студент → Керівник"
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
            name: 'upload_materials',
            isActive: (state) =>
              state === 'student_upload_thesis' ||
              state === 'supervisor_review_thesis',
            role: ThesisRole.student,
            component: <UploadMaterialsAction processId={processId} />,
          },
          {
            name: 'supervisor_review',
            isActive: (state) => state === 'supervisor_review_thesis',
            role: ThesisRole.supervisor,
            component: <SupervisorReviewAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
