/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, ReactNode } from 'react';

export type ProviderEntry<P = any> = ComponentType<P> | [ComponentType<P>, P];

export type ProvidersComposerProps = {
  providers: ProviderEntry[];
  children: ReactNode;
};

export const ProvidersComposer = ({ providers, children }: ProvidersComposerProps) => {
  return (providers as ProviderEntry[]).reduceRight((acc, entry) => {
    if (Array.isArray(entry)) {
      const [Provider, props] = entry;
      return <Provider {...props}>{acc}</Provider>;
    }

    const Provider = entry;
    return <Provider>{acc}</Provider>;
  }, children);
};
