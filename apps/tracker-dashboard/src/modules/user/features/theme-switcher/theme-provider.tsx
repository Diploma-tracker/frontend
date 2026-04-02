import { type PropsWithChildren } from 'react';

import { reatomComponent } from '@reatom/react';

import { themeAtom } from '../../models';

export const ThemeProvider = reatomComponent<PropsWithChildren>(function ThemeProvider({ children }) {
  themeAtom();

  return <>{children}</>;
}, 'ThemeProvider');
