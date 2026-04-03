import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui-kit/components/common/data-display/avatar';

import { userAtom } from '../../models';

export const CurrentUserAvatar = () => {
  const { initials, avatarUrl } = userAtom();

  return (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src={avatarUrl} alt="your avatar image" />
      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
    </Avatar>
  );
};
