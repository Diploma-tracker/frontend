/**
 * TopicApprovalPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { TextFormField } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomForm } from '@reatom/core';
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
  StageDescription,
} from './common';

interface TopicApprovalPanelProps {
  stage: Stage;
}

const chooseTopicSchema = z.object({
  processId: z.string().min(1),
  topicUk: z.string().min(1),
  topicEn: z.string().min(1),
});

// eslint-disable-next-line react-refresh/only-export-components
export const chooseTopicForm = reatomForm(
  { processId: '', topicUk: '', topicEn: '' },
  {
    schema: chooseTopicSchema,
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'CHOOSE_TOPIC',
          topicUk: values.topicUk,
          topicEn: values.topicEn,
        },
      });
    },
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'chooseTopicForm',
  },
);

const SubmitTopicAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  const { fields, submit } = chooseTopicForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={
          <Button size="sm">
            {t('thesisProcess.topicApproval.submitTopicButton')}
          </Button>
        }
        title={t('thesisProcess.topicApproval.dialogTitle')}
        submitLabel={t('thesisProcess.topicApproval.submitLabel')}
        onSubmit={submit}
      >
        <TextFormField
          label={t('thesisProcess.topicApproval.topicUkLabel')}
          placeholder={t('thesisProcess.topicApproval.topicUkPlaceholder')}
          field={fields.topicUk}
        />
        <TextFormField
          label={t('thesisProcess.topicApproval.topicEnLabel')}
          placeholder={t('thesisProcess.topicApproval.topicEnPlaceholder')}
          field={fields.topicEn}
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
          <Button size="sm">
            {t('thesisProcess.topicApproval.approveButton')}
          </Button>
        }
        title={t('thesisProcess.topicApproval.confirmApproveSupervisor')}
        confirmLabel={t('thesisProcess.topicApproval.approveButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'APPROVE_TOPIC_BY_SUPERVISOR' },
          })
        }
      />
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            {t('thesisProcess.topicApproval.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.topicApproval.confirmRejectSupervisor')}
        description={t(
          'thesisProcess.topicApproval.rejectDescriptionSupervisor',
        )}
        confirmLabel={t('thesisProcess.topicApproval.rejectButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'REJECT_TOPIC_BY_SUPERVISOR' },
          })
        }
      />
    </ActionButtons>
  );
};

const AdminReviewAction = ({ processId }: { processId: string }) => {
  const { t } = useTranslation();
  return (
    <ActionButtons>
      <ConfirmationModal
        trigger={
          <Button size="sm">
            {t('thesisProcess.topicApproval.approveButton')}
          </Button>
        }
        title={t('thesisProcess.topicApproval.confirmApproveAdmin')}
        confirmLabel={t('thesisProcess.topicApproval.approveButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'APPROVE_TOPIC_BY_ADMIN' },
          })
        }
      />
      <ConfirmationModal
        trigger={
          <Button size="sm" variant="outline">
            {t('thesisProcess.topicApproval.rejectButton')}
          </Button>
        }
        title={t('thesisProcess.topicApproval.confirmRejectAdmin')}
        confirmLabel={t('thesisProcess.topicApproval.rejectButton')}
        onConfirm={() =>
          sendProcessEvent({
            processId,
            event: { name: 'REJECT_TOPIC_BY_ADMIN' },
          })
        }
      />
    </ActionButtons>
  );
};

export const TopicApprovalPanel = reatomComponent(function TopicApprovalPanel({
  stage,
}: TopicApprovalPanelProps) {
  const { t } = useTranslation();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description={t('thesisProcess.topicApproval.description')}
        responsible={t('thesisProcess.topicApproval.responsible')}
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem
          label={t('thesisProcess.topicApproval.topicUkLabel')}
          value={data?.topic?.uk ?? '—'}
        />
        <DataItem
          label={t('thesisProcess.topicApproval.topicEnLabel')}
          value={data?.topic?.en ?? '—'}
        />
      </div>

      <ActionsSection
        status={stage.status}
        state={stage.state}
        actions={[
          {
            name: 'submit_topic',
            isActive: (state) =>
              state === 'student_upload_topic' ||
              state === 'supervisor_review_topic' ||
              state === 'admin_review_topic',
            role: ThesisRole.student,
            component: <SubmitTopicAction processId={processId} />,
          },
          {
            name: 'supervisor_review',
            isActive: (state) => state === 'supervisor_review_topic',
            role: ThesisRole.supervisor,
            component: <SupervisorReviewAction processId={processId} />,
          },
          {
            name: 'admin_review',
            isActive: (state) => state === 'admin_review_topic',
            role: ThesisRole.admin,
            component: <AdminReviewAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
