import { useTranslation } from '@/shared/utils/i18n';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { DropdownMenuItem } from '@repo/ui-kit/components/dropdown-menu';

import { AppTheme, themeAtom, toggleTheme } from '../../models/theme-model';

export const ThemeSwitcher = reatomComponent(function ThemeSwitcher() {
  const { t } = useTranslation();
  const theme = themeAtom();
  const isLight = theme === AppTheme.Light;

  return (
    <DropdownMenuItem onClick={toggleTheme}>
      {isLight ? <MoonIcon /> : <SunIcon />}
      {t('user.switchTheme')}
    </DropdownMenuItem>
  );
});
