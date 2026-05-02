import { UsersFourIcon } from '@phosphor-icons/react';

import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui-kit/components/common/data-display/avatar';

type GroupAvatarProps = {
  groupId: string;
};

export const GroupAvatar = (props: GroupAvatarProps) => {
  const { groupId } = props;
  //TODO: fetch group by id and get avatar url
  console.debug(groupId);

  return (
    <Avatar className="size-8">
      <AvatarImage src="" alt="Group avatar image" />
      <AvatarFallback>
        <UsersFourIcon />
      </AvatarFallback>
    </Avatar>
  );
};
