import type { ReactNode } from 'react';

import { AppSidebar, LangSelect } from '@/modules/app';
import { ThemeSwitcher } from '@/modules/user';
import { Container } from '@/shared/components';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui-kit/components/sidebar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-10" />
          </div>

          <div className="flex items-center gap-2">
            <LangSelect />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Container className="py-10">{children}</Container>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
