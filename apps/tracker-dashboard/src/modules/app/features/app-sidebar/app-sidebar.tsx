import { useTranslation } from 'react-i18next';

import { UserMenu } from '@/modules/user';
import { Logo } from '@/shared/components';
import { CalendarIcon, GraduationCapIcon, ListChecksIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@repo/ui-kit/components/sidebar';

import AppSidebarMainNav from './components/app-sidebar-main-nav';

export const AppSidebar = () => {
  const { t } = useTranslation();

  const NAV_MENU = [
    {
      title: t('sidebar.nav.projects'),
      url: '#',
      icon: GraduationCapIcon,
      items: [
        {
          title: t('sidebar.nav.diploma1'),
          url: '#',
        },
        {
          title: t('sidebar.nav.diploma2'),
          url: '#',
        },
      ],
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
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <Logo />

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="truncate font-medium">{t('sidebar.title')}</span>
                  <span className="truncate text-xs">{t('sidebar.subtitle')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
