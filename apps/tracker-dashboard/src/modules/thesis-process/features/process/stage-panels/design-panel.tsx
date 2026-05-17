/**
 * DesignPanel
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
  const { t } = useTranslation();
  const { fields, submit } = uploadThesisMaterialsForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">{t('thesisProcess.design.uploadButton')}</Button>
        }
        title={t('thesisProcess.design.dialogTitle')}
        submitLabel={t('thesisProcess.design.submitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.design.archiveFieldLabel')}
          accept=".zip,.rar,.7z"
          field={fields.thesisMaterialsArchive}
        />
        <FileInputField
          label={t('thesisProcess.design.reportFieldLabel')}
          accept=".pdf,.doc,.docx"
          field={fields.thesisReport}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

const SupervisorReviewAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  return (
    <ActionButtons>
      <ConfirmationModal
        trigger={
          <Button size="sm">{t('thesisProcess.design.approveButton')}</Button>
        }
        title={t('thesisProcess.design.confirmApprove')}
        description={t('thesisProcess.design.approveDescription')}
        confirmLabel={t('thesisProcess.design.approveButton')}
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
            {t('thesisProcess.design.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.design.confirmReject')}
        description={t('thesisProcess.design.rejectDescription')}
        confirmLabel={t('thesisProcess.design.rejectButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'REJECT_THESIS_MATERIALS' },
          })
        }
      />
    </ActionButtons>
  );
};

export const DesignPanel = reatomComponent(function DesignPanel({
  stage,
}: DesignPanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.design.description')}
        responsible={t('thesisProcess.design.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.design.archiveLabel')}
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
          label={t('thesisProcess.design.reportLabel')}
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
