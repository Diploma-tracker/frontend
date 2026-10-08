import { useTranslation } from '@/shared/utils/i18n';
import {
  CalendarIcon,
  CaretRightIcon,
  FilesIcon,
  ListChecksIcon,
} from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui-kit/components/common/layout/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/ui-kit/components/sidebar';

type NavSubItem = {
  title: string;
  url: string;
};

type NavItem = {
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  url?: string;
  items?: NavSubItem[];
};

interface Props {
  onNavigate?: () => void;
}

export default function AppSidebarMainNav(props: Props) {
  const { onNavigate } = props;
  const { t } = useTranslation();

  const NAV_MENU: NavItem[] = [
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
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('sidebar.platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_MENU.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.defaultOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url} onClick={onNavigate}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild>
                <Link to={item.url} onClick={onNavigate}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
