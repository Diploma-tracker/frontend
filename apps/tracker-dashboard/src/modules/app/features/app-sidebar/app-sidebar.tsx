import { UserMenu } from '@/modules/user';
import { Logo } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import {
  CalendarIcon,
  FilesIcon,
  ListChecksIcon,
  SquaresFourIcon,
} from '@phosphor-icons/react';

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

  const NAV_MENU = [
    {
      title: t('sidebar.nav.thesisProcess'),
      url: '/thesis-process',
      icon: FilesIcon,
    },
    {
      title: t('sidebar.nav.projectEnrollment'),
      url: '/project-enrollment',
      icon: ListChecksIcon,
    },
    {
      title: t('sidebar.nav.schedule'),
      url: '/schedule',
      icon: CalendarIcon,
    },
    {
      title: t('sidebar.nav.formBuilder'),
      url: '/form-builder',
      icon: SquaresFourIcon,
    },
  ];

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
            <div className="absolute inset-0 flex items-center justify-center group-hover:hidden group-hover:delay-500">
              <Logo />
            </div>
            <div className="absolute inset-0 z-10 hidden items-center justify-center group-hover:flex group-hover:delay-500">
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
        <AppSidebarMainNav navItems={NAV_MENU} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
