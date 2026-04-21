import { UserMenu } from '@/modules/user';
import { Logo } from '@/shared/components';
import { GraduationCapIcon } from '@phosphor-icons/react';
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

const NAV_MENU = [
  {
    title: 'Projects',
    url: '#',
    icon: GraduationCapIcon,
    items: [
      {
        title: 'Dimploma 1',
        url: '#',
      },
      {
        title: 'Dimploma 2',
        url: '#',
      },
    ],
  },
];

export const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <Logo />

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="truncate font-medium">Tracker dashboard</span>
                  <span className="truncate text-xs">Main view</span>
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
