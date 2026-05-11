/**
 * InitProcessPanel — Admin assigns 4 roles.
 *
 * Static info + data: always shown (actors if assigned, "—" otherwise).
 * Actions:           only when status === 'active'.
 */
import React from 'react';
import { useEffectOnce } from 'react-use';

import { UserSelectorField } from '@/modules/user';
import { userQuery } from '@/modules/user';
import { reatomForm } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { z } from 'zod';

import { LoginTokenUserRole } from '@repo/api/model';
import { Button } from '@repo/ui-kit/components/common/data-display/button';

import {
  type Stage,
  ThesisRole,
  sendProcessEvent,
  thesisData,
} from '../../../models/bachelor-thesis-process';
import {
  ActionButtons,
  ActionDialog,
  ActionsSection,
  DataItem,
  StageDescription,
} from './common';

interface InitProcessPanelProps {
  processId: string;
  stage: Stage;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  supervisor: 'Науковий керівник',
  plagiarism_supervisor: 'Перевіряючий антиплагіату',
  internship_supervisor: 'Керівник практики',
  commission_member: 'Член комісії',
  reviewer: 'Рецензент',
};

const DISPLAYED_ROLES = [
  'student',
  'supervisor',
  'plagiarism_supervisor',
  'internship_supervisor',
  'commission_member',
  'reviewer',
];

const schema = z.object({
  plagiarismSupervisor: z.string().min(1),
  internshipSupervisor: z.string().min(1),
  commissionMember: z.string().min(1),
  reviewer: z.string().min(1),
  processId: z.string().min(1),
});

export type InitProcessValues = z.infer<typeof schema>;

// eslint-disable-next-line react-refresh/only-export-components
export const initProcessForm = reatomForm(
  {
    plagiarismSupervisor: '',
    internshipSupervisor: '',
    commissionMember: '',
    reviewer: '',
    processId: '',
  },
  {
    onSubmit: async (values) => {
      await sendProcessEvent({
        processId: values.processId,
        event: {
          name: 'INIT_PROCESS',
          plagiarismSupervisorId: values.plagiarismSupervisor,
          internshipSupervisorId: values.internshipSupervisor,
          commissionMemberId: values.commissionMember,
          reviewerId: values.reviewer,
        },
      });
    },

    schema,
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'createAllocationRoundForm',
  },
);

const InitAction = ({ processId }: { processId: string }) => {
  const [open, setOpen] = React.useState(false);
  const { fields, submit } = initProcessForm;

  useEffectOnce(() => {
    fields.processId.set(processId);
  });

  return (
    <ActionButtons>
      <ActionDialog
        trigger={<Button size="sm">Призначити ролі</Button>}
        title="Призначення ролей"
        submitLabel="Підтвердити та перейти далі"
        onSubmit={submit}
        open={open}
        onOpenChange={setOpen}
      >
        <UserSelectorField
          label="Перевіряючий антиплагіату"
          field={fields.plagiarismSupervisor}
          role={LoginTokenUserRole.staff}
        />
        <UserSelectorField
          label="Керівник практики"
          field={fields.internshipSupervisor}
          role={LoginTokenUserRole.staff}
        />
        <UserSelectorField
          label="Член комісії"
          field={fields.commissionMember}
          role={LoginTokenUserRole.staff}
        />
        <UserSelectorField
          label="Рецензент"
          field={fields.reviewer}
          role={LoginTokenUserRole.staff}
        />
      </ActionDialog>
    </ActionButtons>
  );
};

export const InitProcessPanel = reatomComponent(function InitProcessPanel({
  processId,
  stage,
}: InitProcessPanelProps) {
  const thesis = thesisData();
  const actors = thesis?.actors ?? [];
  const [actorsNames, setActorsNames] = React.useState<Record<string, string>>(
    {},
  );

  const fetchActorNames = async () => {
    const results = await Promise.all(
      actors.map((actor) =>
        userQuery(actor.userId)
          .fetch()
          .then((user) => ({
            userId: actor.userId,
            name: `${user.firstName} ${user.lastName}`,
          }))
          .catch(() => ({ userId: actor.userId, name: '—' })),
      ),
    );

    const namesMap = Object.fromEntries(results.map((r) => [r.userId, r.name]));
    setActorsNames(namesMap);
  };

  React.useEffect(() => {
    fetchActorNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actors]);

  // Build lookup: role → userId
  const actorByRole = Object.fromEntries(
    actors.map((a) => [a.role, actorsNames[a.userId] ?? '—']),
  );

  return (
    <div className="flex flex-col gap-4">
      <StageDescription
        description="Адміністратор призначає відповідальних осіб для кожного етапу дипломного процесу."
        responsible="Адміністратор"
      />

      {/* Data section — always shown */}
      <div className="flex flex-col gap-2">
        {DISPLAYED_ROLES.map((role) => (
          <DataItem
            key={role}
            label={ROLE_LABELS[role] ?? role}
            value={actorByRole[role] ?? '—'}
          />
        ))}
      </div>

      <ActionsSection
        state={stage.state}
        actions={[
          {
            name: 'init',
            isActive: (state) => state === 'start',
            role: ThesisRole.admin,
            component: <InitAction processId={processId} />,
          },
        ]}
      />
    </div>
  );
});
