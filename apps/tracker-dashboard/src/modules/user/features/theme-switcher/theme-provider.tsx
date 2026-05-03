import { type PropsWithChildren } from 'react';

import { effect } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { AppTheme, themeAtom } from '../../models';

export const ThemeProvider = reatomComponent<PropsWithChildren>(
  function ThemeProvider({ children }) {
    const theme = themeAtom();

    effect(() => {
      document.documentElement.classList.toggle(
        'dark',
        theme === AppTheme.Dark,
      );
    });

    return <>{children}</>;
  },
  'ThemeProvider',
);
