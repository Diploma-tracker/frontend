import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../../lib/utils';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'ui:flex ui:min-w-0 ui:flex-1 ui:flex-col ui:items-center ui:justify-center ui:gap-6 ui:rounded-lg ui:border-dashed ui:p-6 ui:text-center ui:text-balance ui:md:p-12',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'ui:flex ui:max-w-sm ui:flex-col ui:items-center ui:gap-2 ui:text-center',
        className,
      )}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'ui:mb-2 ui:flex ui:shrink-0 ui:items-center ui:justify-center ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'ui:bg-transparent',
        icon: 'ui:flex ui:size-10 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-lg ui:bg-muted ui:text-foreground ui:[&_svg:not([class*=size-])]:size-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('ui:text-lg ui:font-medium ui:tracking-tight', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'ui:text-sm/relaxed ui:text-muted-foreground ui:[&>a]:underline ui:[&>a]:underline-offset-4 ui:[&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'ui:flex ui:w-full ui:max-w-sm ui:min-w-0 ui:flex-col ui:items-center ui:gap-4 ui:text-sm ui:text-balance',
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
