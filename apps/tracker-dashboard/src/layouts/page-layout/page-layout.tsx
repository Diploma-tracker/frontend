import type { ReactNode } from 'react';

import { AppSidebar, LangSelect } from '@/modules/app';
import { ThemeSwitcher } from '@/modules/user';
import { Container } from '@/shared/components';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui-kit/components/sidebar';
import { cn } from '@repo/ui-kit/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  height?: 'auto' | 'screen';
}

export const PageLayout = ({ children, height = 'auto' }: PageLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset
        className={cn('', {
          'flex h-screen max-h-screen flex-col': height === 'screen',
        })}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <LangSelect />
            <ThemeSwitcher />
          </div>
        </header>

        <Container
          className={cn('flex-1 py-10', {
            'overflow-hidden': height === 'screen',
          })}
        >
          {children}
        </Container>
      </SidebarInset>
    </SidebarProvider>
  );
};
