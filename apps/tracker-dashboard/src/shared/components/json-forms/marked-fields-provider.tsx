import { type ReactNode } from 'react';

import { MarkedFieldsContext } from './marked-fields-context';

interface JsonFormsMarkedFieldsProviderProps {
  paths: readonly string[];
  children: ReactNode;
}

export const JsonFormsMarkedFieldsProvider = ({
  paths,
  children,
}: JsonFormsMarkedFieldsProviderProps) => (
  <MarkedFieldsContext.Provider value={paths}>
    {children}
  </MarkedFieldsContext.Provider>
);
