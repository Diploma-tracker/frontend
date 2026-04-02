import React from 'react';

import { ThemeProvider } from '../features';

type Props = {
  children: React.ReactNode;
};

export const UserModuleProvider = ({ children }: Props) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
