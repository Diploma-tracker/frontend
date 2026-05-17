/**
 * InternshipPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { FileInputField } from '@/shared/components/form/file-form-field';
import { useTranslation } from '@/shared/utils/i18n';
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

interface InternshipPanelProps {
  stage: Stage;
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
  const { t } = useTranslation();
  const { fields, submit } = uploadInternshipReportForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">
            {t('thesisProcess.internship.uploadButton')}
          </Button>
        }
        title={t('thesisProcess.internship.dialogTitle')}
        submitLabel={t('thesisProcess.internship.submitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.internship.reportFieldLabel')}
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
}) => {
  const { t } = useTranslation();
  return (
    <ActionButtons>
      <ConfirmationModal
        trigger={
          <Button size="sm">
            {t('thesisProcess.internship.approveButton')}
          </Button>
        }
        title={t('thesisProcess.internship.confirmApprove')}
        confirmLabel={t('thesisProcess.internship.approveButton')}
        onConfirm={() =>
          sendProcessEvent({ processId, event: { name: 'APPROVE_INTERNSHIP' } })
        }
      />
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            {t('thesisProcess.internship.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.internship.confirmReject')}
        description={t('thesisProcess.internship.rejectDescription')}
        confirmLabel={t('thesisProcess.internship.rejectButton')}
        onConfirm={() =>
          sendProcessEvent({ processId, event: { name: 'REJECT_INTERNSHIP' } })
        }
      />
    </ActionButtons>
  );
};

export const InternshipPanel = reatomComponent(function InternshipPanel({
  stage,
}: InternshipPanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.internship.description')}
        responsible={t('thesisProcess.internship.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.internship.reportLabel')}
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
