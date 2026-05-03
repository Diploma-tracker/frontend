import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../../lib/utils';

const badgeVariants = cva(
  'ui:inline-flex ui:w-fit ui:shrink-0 ui:items-center ui:justify-center ui:gap-1 ui:overflow-hidden ui:rounded-full ui:border ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium ui:whitespace-nowrap ui:transition-all ui:focus-visible:border-ring ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50 ui:[&>svg]:pointer-events-none ui:[&>svg]:size-[1em]',
  {
    variants: {
      variant: {
        default:
          'ui:bg-secondary ui:text-secondary-foreground ui:[a&]:hover:bg-secondary/90',
        filled: 'ui:border-transparent',
        outline: 'ui:bg-transparent',
      },
      intent: {
        primary: '',
        destructive: '',
        success: '',
        pending: '',
        draft: '',
      },
    },
    compoundVariants: [
      // PRIMARY
      {
        variant: 'filled',
        intent: 'primary',
        className: 'ui:border-primary/60 ui:bg-primary/20 ui:text-primary',
      },
      {
        variant: 'outline',
        intent: 'primary',
        className: 'ui:border-primary ui:text-primary',
      },

      // DESTRUCTIVE
      {
        variant: 'filled',
        intent: 'destructive',
        className:
          'ui:border-destructive/60 ui:bg-destructive/20 ui:text-destructive',
      },
      {
        variant: 'outline',
        intent: 'destructive',
        className: 'ui:border-destructive ui:text-destructive',
      },

      // SUCCESS
      {
        variant: 'filled',
        intent: 'success',
        className: 'ui:border-success/60 ui:bg-success/20 ui:text-success',
      },
      {
        variant: 'outline',
        intent: 'success',
        className: 'ui:border-success ui:text-success',
      },

      // PENDING
      {
        variant: 'filled',
        intent: 'pending',
        className: 'ui:border-pending/60 ui:bg-pending/20 ui:text-pending',
      },
      {
        variant: 'outline',
        intent: 'pending',
        className: 'ui:border-pending ui:text-pending',
      },

      // DRAFT
      {
        variant: 'filled',
        intent: 'draft',
        className: 'ui:border-draft/60 ui:bg-draft/20 ui:text-draft',
      },
      {
        variant: 'outline',
        intent: 'draft',
        className: 'ui:border-draft ui:text-draft',
      },
    ],
    defaultVariants: {
      variant: 'default',
      intent: 'primary',
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant,
  intent,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, intent }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
