import { useQuery } from '@/shared/model/query';
import { reatomComponent } from '@reatom/react';

import { userQuery } from '../../models/users-model';
import { UserAvatar } from '../user-avatar/user-avatar';

interface UserInfoProps {
  userId: string;
}

export const UserInfo = reatomComponent(function UserInfo({
  userId,
}: UserInfoProps) {
  const { data } = useQuery(userQuery, userId);

  const { firstName, lastName, email } = data()!;
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="flex items-center gap-2 py-1">
      <UserAvatar userId={userId} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate text-sm leading-tight font-medium">
          {fullName}
        </span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
});
