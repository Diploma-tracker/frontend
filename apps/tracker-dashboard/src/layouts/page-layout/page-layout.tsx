import type { ReactNode } from 'react';

import { AppSidebar, LangSelect } from '@/modules/app';
import { ThemeSwitcher } from '@/modules/user';
import { Container } from '@/shared/components';

import { SidebarInset, SidebarProvider } from '@repo/ui-kit/components/sidebar';
import { cn } from '@repo/ui-kit/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  height?: 'auto' | 'screen';
  /**
   * Drops the container constraints so the child can fill the whole area below
   * the header, edge to edge. Used by full-bleed surfaces such as the BPMN
   * canvas, which hosts its own floating panels.
   */
  bleed?: boolean;
}

export const PageLayout = ({
  children,
  height = 'auto',
  bleed = false,
}: PageLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset
        className={cn('', {
          'flex h-screen max-h-screen flex-col': height === 'screen',
        })}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-2">
            <LangSelect />
            <ThemeSwitcher />
          </div>
        </header>

        <Container
          className={cn('flex-1', {
            'py-10': !bleed,
            // `Container` also constrains width and adds horizontal padding.
            'min-h-0 max-w-none px-0': bleed,
            'overflow-hidden': height === 'screen',
          })}
        >
          {children}
        </Container>
      </SidebarInset>
    </SidebarProvider>
  );
};
