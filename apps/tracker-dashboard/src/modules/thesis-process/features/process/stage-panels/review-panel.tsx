/**
 * ReviewPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active'.
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
  DataItem,
  FileLink,
  StageDescription,
} from './common';

interface ReviewPanelProps {
  processId: string;
  stage: Stage;
  data: ThesisDataDTO | null;
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
  const { fields, submit } = uploadReviewReportForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Завантажити рецензію</Button>}
        title="Завантаження рецензії"
        submitLabel="Надіслати рецензію"
        onSubmit={submit}
      >
        <FileInputField
          label="Рецензія (файл)"
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
  processId,
  stage,
  data,
}: ReviewPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Рецензент готує та завантажує офіційну рецензію на дипломну роботу."
        responsible="Рецензент"
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label="Рецензія"
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
