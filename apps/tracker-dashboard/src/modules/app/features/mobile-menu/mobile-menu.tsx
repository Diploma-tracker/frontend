import { useState } from 'react';

import { UserMenu } from '@/modules/user';
import { useTranslation } from '@/shared/utils/i18n';
import { ListIcon, XIcon } from '@phosphor-icons/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui-kit/components/common/floating/sheet';
import { SidebarMenu, SidebarMenuItem } from '@repo/ui-kit/components/sidebar';

import AppSidebarMainNav from '../app-sidebar/components/app-sidebar-main-nav';

export const MobileMenu = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('sidebar.openMenu')}>
          {open ? <XIcon /> : <ListIcon />}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="top"
        showCloseButton={false}
        style={{ top: '4rem', bottom: 0, gap: 0 }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('sidebar.title')}</SheetTitle>
          <SheetDescription>{t('sidebar.subtitle')}</SheetDescription>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
};
