import { UserMenu } from '@/modules/user';
import { Logo } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@repo/ui-kit/components/sidebar';

import AppSidebarMainNav from './components/app-sidebar-main-nav';

export const AppSidebar = () => {
  const { t } = useTranslation();
  const { state } = useSidebar();

  const trigger = () => (
    <SidebarTrigger
      collapsedLabel={t('sidebar.collapsed')}
      expandedLabel={t('sidebar.expanded')}
    />
  );

  return (
    <Sidebar collapsible="icon" className="group">
      <SidebarHeader className="w-full px-2">
        {state === 'collapsed' ? (
          <div className="relative flex h-8 w-full items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-start group-hover:hidden group-hover:delay-500">
              <Logo />
            </div>
            <div className="absolute inset-0 z-10 hidden items-center justify-start group-hover:flex group-hover:delay-500">
              {trigger()}
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <Logo />
            {trigger()}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <AppSidebarMainNav />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu variant="full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
