import type { ReactNode } from 'react';

import { UserInfo, GroupInfo } from '@/modules/user';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { UsersFourIcon, UsersIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { defenseSessionDetailsQuery } from '../../models';

function SideSection({
  title,
  icon,
  count,
  empty,
  children,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  empty: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground">{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <div className="max-h-40 overflow-y-auto">{children}</div>
      )}
    </div>
  );
}

export const SideContent = reatomComponent(function SideContent({ sessionId }: { sessionId: string }) {
  const { t } = useTranslation();
  const { data } = useQuery(defenseSessionDetailsQuery, sessionId);
  const session = data();

  if (!session) return null;

  const participants = session.participants ?? [];
  const allowedStudents = session.allowedStudents ?? [];
  const allowedGroups = session.allowedGroups ?? [];

  return (
    <div className="flex flex-col gap-5 rounded-lg border p-4 text-sm">
      <SideSection
        title={t('defense.session.detail.participantsLabel')}
        icon={<UsersIcon className="size-4 text-muted-foreground" />}
        count={participants.length}
        empty={t('defense.session.detail.noParticipants')}
      >
        {participants.map((u) => (
          <UserInfo key={u.id} userId={u.id} />
        ))}
      </SideSection>

      <Separator />

      <SideSection
        title={t('defense.session.detail.allowedStudentsLabel')}
        icon={<UsersIcon className="size-4 text-muted-foreground" />}
        count={allowedStudents.length}
        empty={t('defense.session.detail.noAllowedStudents')}
      >
        {allowedStudents.map((u) => (
          <UserInfo key={u.id} userId={u.id} />
        ))}
      </SideSection>

      <Separator />

      <SideSection
        title={t('defense.session.detail.allowedGroupsLabel')}
        icon={<UsersFourIcon className="size-4 text-muted-foreground" />}
        count={allowedGroups.length}
        empty={t('defense.session.detail.noAllowedGroups')}
      >
        {allowedGroups.map((g) => (
          <GroupInfo key={g.id} groupId={g.id} />
        ))}
      </SideSection>
    </div>
  );
}, 'SideContent');
