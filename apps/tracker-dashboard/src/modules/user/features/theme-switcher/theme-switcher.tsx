import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { cn } from '@repo/ui-kit/lib/utils';

import { AppTheme, themeAtom, toggleTheme } from '../../models/theme-model';

export const ThemeSwitcher = reatomComponent(function ThemeSwitcher() {
  const theme = themeAtom();
  const isLight = theme === AppTheme.Light;

  const iconClassName = 'absolute inset-0 transition-transform duration-500 ease-in-out';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative grid place-items-center overflow-hidden"
    >
      <div className={cn(iconClassName, 'grid place-items-center', isLight ? 'rotate-0' : '-rotate-90 opacity-0')}>
        <SunIcon />
      </div>

      <div className={cn(iconClassName, 'grid place-items-center', isLight ? 'rotate-90 opacity-0' : 'rotate-0')}>
        <MoonIcon />
      </div>
    </Button>
  );
});
