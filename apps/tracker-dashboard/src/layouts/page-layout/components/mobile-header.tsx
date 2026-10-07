import { MobileMenu } from '@/modules/app';
import { Logo } from '@/shared/components';

export const MobileHeader = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden">
      <Logo />
      <MobileMenu />
    </header>
  );
};
