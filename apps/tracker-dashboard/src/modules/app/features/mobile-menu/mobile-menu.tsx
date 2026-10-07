import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { UserMenu } from '@/modules/user';
import { useTranslation } from '@/shared/utils/i18n';
import { ListIcon, XIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { SidebarMenu, SidebarMenuItem } from '@repo/ui-kit/components/sidebar';
import { cn } from '@repo/ui-kit/lib/utils';

import AppSidebarMainNav from '../app-sidebar/components/app-sidebar-main-nav';

const PANEL_ID = 'mobile-menu-panel';

export const MobileMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('sidebar.openMenu')}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <XIcon /> : <ListIcon />}
      </Button>

      {createPortal(
        <div
          id={PANEL_ID}
          inert={!open}
          className={cn(
            'fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col bg-background transition-transform duration-300 ease-out md:hidden',
            open ? 'translate-y-0' : 'pointer-events-none -translate-y-full',
          )}
        >
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <AppSidebarMainNav onNavigate={() => setOpen(false)} />
          </nav>

          <div className="shrink-0 border-t p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <UserMenu variant="compact" />
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};
