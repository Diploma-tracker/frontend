/**
 * InternshipPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { FileInputField } from '@/shared/components/form/file-form-field';
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
  FileLink,
  StageDescription,
} from './common';

const STATE_LABELS: Record<string, string> = {
  student_upload_internship_report: 'Студент завантажує звіт',
  practice_supervisor_review: 'На перевірці керівника практики',
};

interface InternshipPanelProps {
  processId: string;
  stage: Stage;
  data: ThesisDataDTO | null;
}

const uploadInternshipReportSchema = z.object({
  processId: z.string().min(1),
  internshipReport: z.instanceof(File),
});

// eslint-disable-next-line react-refresh/only-export-components
export const uploadInternshipReportForm = reatomForm(
  {
    processId: '',
    internshipReport: reatomField<File | null>(null),
  },
  {
    schema: uploadInternshipReportSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'UPLOAD_INTERNSHIP_REPORT',
          internshipReport: values.internshipReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'uploadInternshipReportForm',
  },
);

const UploadReportAction = ({ processId }: { processId: string }) => {
  const { fields, submit } = uploadInternshipReportForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Завантажити звіт</Button>}
        title="Завантаження звіту з практики"
        submitLabel="Надіслати на перевірку"
        onSubmit={submit}
      >
        <FileInputField
          label="Звіт з практики"
          accept=".pdf,.doc,.docx"
          field={fields.internshipReport}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

const PracticeSupervisorReviewAction = ({
  processId,
}: {
  processId: string;
}) => (
  <ActionButtons>
    <ConfirmationModal
      trigger={<Button size="sm">Затвердити</Button>}
      title="Затвердити звіт з практики?"
      confirmLabel="Затвердити"
      onConfirm={() =>
        sendProcessEvent({ processId, event: { name: 'APPROVE_INTERNSHIP' } })
      }
    />
    <ConfirmationModal
      trigger={
        <Button size="sm" variant="outline">
          Відхилити
        </Button>
      }
      title="Відхилити звіт?"
      description="Студент отримає завдання виправити та повторно завантажити."
      confirmLabel="Відхилити"
      onConfirm={() =>
        sendProcessEvent({ processId, event: { name: 'REJECT_INTERNSHIP' } })
      }
    />
  </ActionButtons>
);

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export const InternshipPanel = reatomComponent(function InternshipPanel({
  processId,
  stage,
  data,
}: InternshipPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Студент завантажує звіт з переддипломної практики для підтвердження керівником."
        responsible="Студент → Керівник практики"
        stateLabel={
          stage.state ? (STATE_LABELS[stage.state] ?? stage.state) : null
        }
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label="Звіт з практики"
          value={
            data?.internshipReport ? (
              <FileLink
                processId={processId}
                fileId={data.internshipReport.fileId}
                label={`v${data.internshipReport.version}`}
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
            name: 'upload_report',
            isActive: (state) =>
              state === 'student_upload_internship_report' ||
              state === 'practice_supervisor_review',
            role: ThesisRole.student,
            component: <UploadReportAction processId={processId} />,
          },
          {
            name: 'practice_supervisor_review',
            isActive: (state) => state === 'practice_supervisor_review',
            role: ThesisRole.internship_supervisor,
            component: <PracticeSupervisorReviewAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
