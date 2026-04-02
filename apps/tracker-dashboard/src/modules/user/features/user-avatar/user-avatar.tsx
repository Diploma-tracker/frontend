import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui-kit/components/common/data-display/avatar';

type UserAvatarProps = {
  userId: string;
};

export const UserAvatar = (props: UserAvatarProps) => {
  const { userId } = props;
  //TODO: fetch user by id and get avatar url
  console.debug(userId);

  return (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src="" alt="user avatar image" />
      <AvatarFallback className="rounded-lg">AO</AvatarFallback>
    </Avatar>
  );
};
