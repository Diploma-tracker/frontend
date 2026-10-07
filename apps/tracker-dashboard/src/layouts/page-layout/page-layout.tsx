import type { ReactNode } from 'react';

import { AppSidebar } from '@/modules/app';
import { Container } from '@/shared/components';

import { SidebarInset, SidebarProvider } from '@repo/ui-kit/components/sidebar';
import { cn } from '@repo/ui-kit/lib/utils';

import { MobileHeader } from './components/mobile-header';

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
        <MobileHeader />

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
