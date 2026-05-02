import { logoutAction } from '@/modules/auth';
import { useTranslation } from '@/shared/utils/i18n';
import { CaretUpDownIcon, SignOutIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui-kit/components/dropdown-menu';
import { SidebarMenuButton, useSidebar } from '@repo/ui-kit/components/sidebar';

import { userAtom } from '../../models';
import { UserInfo } from '../user-info/user-info';

export const UserMenu = reatomComponent(function UserMenu() {
  const user = userAtom();
  const { t } = useTranslation();

  const { isMobile } = useSidebar();

  const handleLogout = () => {
    logoutAction();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <UserInfo userId={user.id} />
          <CaretUpDownIcon className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <UserInfo userId={user.id} />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <SignOutIcon />
          {t('user.logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}, 'UserMenu');
