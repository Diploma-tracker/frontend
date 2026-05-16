/**
 * PlagiarismPanel
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

interface PlagiarismPanelProps {
  stage: Stage;
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
  const { t } = useTranslation();
  const { fields, submit } = approvePlagiarismForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">
            {t('thesisProcess.plagiarism.approveWithReportButton')}
          </Button>
        }
        title={t('thesisProcess.plagiarism.dialogTitle')}
        submitLabel={t('thesisProcess.plagiarism.submitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.plagiarism.plagiarismReportFieldLabel')}
          accept=".pdf"
          field={fields.plagiarismReport}
          description={t(
            'thesisProcess.plagiarism.plagiarismReportDescription',
          )}
        />
      </ActionDialog>
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            {t('thesisProcess.plagiarism.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.plagiarism.confirmReject')}
        description={t('thesisProcess.plagiarism.rejectDescription')}
        confirmLabel={t('thesisProcess.plagiarism.rejectButton')}
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
  const { t } = useTranslation();
  const { fields, submit } = fixPlagiarismIssuesForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">
            {t('thesisProcess.plagiarism.reuploadButton')}
          </Button>
        }
        title={t('thesisProcess.plagiarism.reuploadDialogTitle')}
        submitLabel={t('thesisProcess.plagiarism.reuploadSubmitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.plagiarism.archiveFieldLabel')}
          accept=".zip,.rar,.7z"
          field={fields.thesisMaterialsArchive}
        />
        <FileInputField
          label={t('thesisProcess.plagiarism.reportFieldLabel')}
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
  stage,
}: PlagiarismPanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.plagiarism.description')}
        responsible={t('thesisProcess.plagiarism.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.plagiarism.archiveLabel')}
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
          label={t('thesisProcess.plagiarism.reportLabel')}
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
          label={t('thesisProcess.plagiarism.plagiarismReportLabel')}
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
