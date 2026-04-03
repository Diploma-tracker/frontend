import type { ComponentProps } from 'react';

import { cn } from '@repo/ui-kit/lib/utils';

export const Container = (props: ComponentProps<'div'>) => {
  const { className, ...rest } = props;

  return (
    <div {...rest} className={cn('mx-auto w-full max-w-(--container-width) px-(--container-padding-x)', className)} />
  );
};
