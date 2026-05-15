/**
 * TopicApprovalPanel
 *
 * Static info + data: always shown.
 * Actions:           only when status === 'active', routed by state.
 */
import { useEffectOnce } from 'react-use';

import { TextFormField } from '@/shared/components';
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

const STATE_LABELS: Record<string, string> = {
  student_upload_topic: 'Студент вводить тему',
  supervisor_review_topic: 'На перевірці керівника',
  admin_review_topic: 'На перевірці адміністратора',
};

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
  const { fields, submit } = chooseTopicForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Подати тему</Button>}
        title="Введіть тему дипломної роботи"
        submitLabel="Надіслати на розгляд"
        onSubmit={submit}
      >
        <TextFormField
          label="Тема (українською)"
          placeholder="Назва теми..."
          field={fields.topicUk}
        />
        <TextFormField
          label="Topic (English)"
          placeholder="Topic title..."
          field={fields.topicEn}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

const SupervisorReviewAction = ({ processId }: { processId: string }) => (
  <ActionButtons>
    <ConfirmationModal
      trigger={<Button size="sm">Затвердити</Button>}
      title="Затвердити тему?"
      confirmLabel="Затвердити"
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
          Відхилити
        </Button>
      }
      title="Відхилити тему?"
      description="Студент отримає завдання обрати нову тему."
      confirmLabel="Відхилити"
      onConfirm={() =>
        sendProcessEvent({
          processId,
          event: { name: 'REJECT_TOPIC_BY_SUPERVISOR' },
        })
      }
    />
  </ActionButtons>
);

const AdminReviewAction = ({ processId }: { processId: string }) => (
  <ActionButtons>
    <ConfirmationModal
      trigger={<Button size="sm">Затвердити</Button>}
      title="Затвердити тему (адміністратор)?"
      confirmLabel="Затвердити"
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
          Відхилити
        </Button>
      }
      title="Відхилити тему (адміністратор)?"
      confirmLabel="Відхилити"
      onConfirm={() =>
        sendProcessEvent({
          processId,
          event: { name: 'REJECT_TOPIC_BY_ADMIN' },
        })
      }
    />
  </ActionButtons>
);

export const TopicApprovalPanel = reatomComponent(function TopicApprovalPanel({
  stage,
}: TopicApprovalPanelProps) {
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  const data = thesis?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Студент обирає та погоджує тему дипломної роботи з керівником і адміністратором."
        responsible="Студент → Керівник → Адміністратор"
        stateLabel={
          stage.state ? (STATE_LABELS[stage.state] ?? stage.state) : null
        }
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        <DataItem label="Тема (укр)" value={data?.topic?.uk ?? '—'} />
        <DataItem label="Topic (EN)" value={data?.topic?.en ?? '—'} />
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
