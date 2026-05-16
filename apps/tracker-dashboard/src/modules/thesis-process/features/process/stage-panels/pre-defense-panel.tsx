/**
 * PreDefensePanel
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

const CommissionReviewAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  return (
    <ActionButtons>
      <ConfirmationModal
        trigger={
          <Button size="sm">{t('thesisProcess.preDefense.admitButton')}</Button>
        }
        title={t('thesisProcess.preDefense.confirmAdmit')}
        description={t('thesisProcess.preDefense.admitDescription')}
        confirmLabel={t('thesisProcess.preDefense.confirmAdmitButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'APPROVE_PRE_DEFENSE' },
          })
        }
      />
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            {t('thesisProcess.preDefense.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.preDefense.confirmReject')}
        description={t('thesisProcess.preDefense.rejectDescription')}
        confirmLabel={t('thesisProcess.preDefense.rejectButton')}
        onConfirm={() =>
          sendProcessEvent({ processId, event: { name: 'REJECT_PRE_DEFENSE' } })
        }
      />
    </ActionButtons>
  );
};

const ReuploadThesisAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  const { fields, submit } = fixPreDefenseIssuesForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">{t('thesisProcess.preDefense.fixButton')}</Button>
        }
        title={t('thesisProcess.preDefense.fixDialogTitle')}
        submitLabel={t('thesisProcess.preDefense.fixSubmitLabel')}
        onSubmit={submit}
      >
        <FileInputField
          label={t('thesisProcess.preDefense.archiveFieldLabel')}
          accept=".zip,.rar,.7z"
          field={fields.thesisMaterialsArchive}
        />
        <FileInputField
          label={t('thesisProcess.preDefense.reportFieldLabel')}
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
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.preDefense.description')}
        responsible={t('thesisProcess.preDefense.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.preDefense.archiveLabel')}
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
          label={t('thesisProcess.preDefense.reportLabel')}
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
