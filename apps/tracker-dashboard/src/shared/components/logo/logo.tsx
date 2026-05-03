import { khpiLogo } from '@/shared/assets';

import {
  Avatar,
  AvatarImage,
} from '@repo/ui-kit/components/common/data-display/avatar';

export const Logo = () => {
  return (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src={khpiLogo} alt="KHPI university logo" />
    </Avatar>
  );
};
