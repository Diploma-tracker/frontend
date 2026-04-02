import { ThemeSwitcher, UserMenu } from '@/modules/user';
import { Container, Logo } from '@/shared/components';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@repo/ui-kit/components/sidebar';

export const Route = createFileRoute('/(app)/_app')({
  component: BaseLayout,
});

function BaseLayout() {
  return (
    <SidebarProvider>
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

        <SidebarContent></SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-10" />
          </div>
          <ThemeSwitcher />
        </header>

        <main className="flex flex-1 flex-col">
          <Container className="py-10">
            <p>Student profile homepage</p>
          </Container>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
