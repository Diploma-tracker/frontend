import { useQuery } from '@/shared/model/query';
import { getCapitalsFromStrings } from '@/shared/utils/get-capitals-from-strings';
import { reatomComponent } from '@reatom/react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui-kit/components/common/data-display/avatar';
import { cn } from '@repo/ui-kit/lib/utils';

import { userAtom } from '../../models';
import { userQuery } from '../../models/users-model';

type UserAvatarProps = {
  userId: string;
  className?: string;
};

// TODO: for consistency we should create stable size variants for avatar instead hardcoded values
export const UserAvatar = reatomComponent(function UserAvatar({
  userId,
  className,
}: UserAvatarProps) {
  const { data } = useQuery(userQuery, userId);

  const { id: currentUserId } = userAtom();
  const { firstName, lastName } = data()!;
  const isCurrentUser = currentUserId === userId;

  const initials = getCapitalsFromStrings(firstName, lastName);

  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarImage
        src=""
        alt={`${isCurrentUser ? 'your' : 'user'} avatar image`}
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
});
