/**
 * ReviewPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active'.
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
  DataItem,
  FileLink,
  StageDescription,
} from './common';

interface ReviewPanelProps {
  stage: Stage;
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

const uploadReviewReportSchema = z.object({
  processId: z.string().min(1),
  reviewReport: z.instanceof(File),
});

// eslint-disable-next-line react-refresh/only-export-components
export const uploadReviewReportForm = reatomForm(
  {
    processId: '',
    reviewReport: reatomField<File | null>(null),
  },
  {
    schema: uploadReviewReportSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'UPLOAD_REVIEW_REPORT',
          reviewReport: values.reviewReport,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'uploadReviewReportForm',
  },
);

// ---------------------------------------------------------------------------
// Action sub-components
// ---------------------------------------------------------------------------

const UploadReviewAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  const { fields, submit } = uploadReviewReportForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">{t('thesisProcess.review.uploadButton')}</Button>
        }
        title={t('thesisProcess.review.dialogTitle')}
        submitLabel={t('thesisProcess.review.submitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.review.reviewFieldLabel')}
          accept=".pdf,.doc,.docx"
          field={fields.reviewReport}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export const ReviewPanel = reatomComponent(function ReviewPanel({
  stage,
}: ReviewPanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.review.description')}
        responsible={t('thesisProcess.review.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.review.reviewLabel')}
          value={
            data?.reviewReport ? (
              <FileLink
                processId={processId}
                fileId={data.reviewReport.fileId}
                label={`v${data.reviewReport.version}`}
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
            name: 'upload_review',
            isActive: (state) => state === 'reviewer_upload_report',
            role: ThesisRole.reviewer,
            component: <UploadReviewAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
