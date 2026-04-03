import type { PropsWithChildren } from 'react';

import { ProvidersComposer, type ProviderEntry } from './composer';

export const createProviders = (providers: ProviderEntry[]) => {
  const CombinedProviders = ({ children }: PropsWithChildren) => (
    <ProvidersComposer providers={providers}>{children}</ProvidersComposer>
  );

  return CombinedProviders;
};
