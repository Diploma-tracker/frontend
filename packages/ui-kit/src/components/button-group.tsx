import { type VariantProps, cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../lib/utils';
import { Separator } from './common/layout/separator';

const buttonGroupVariants = cva(
  'ui:flex ui:w-fit ui:items-stretch ui:*:focus-visible:relative ui:*:focus-visible:z-10 ui:has-[>[data-slot=button-group]]:gap-2 ui:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md ui:[&>[data-slot=select-trigger]:not([class*=w-])]:w-fit ui:[&>input]:flex-1',
  {
    variants: {
      orientation: {
        horizontal:
          'ui:[&>*:not(:first-child)]:rounded-l-none ui:[&>*:not(:first-child)]:border-l-0 ui:[&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'ui:flex-col ui:[&>*:not(:first-child)]:rounded-t-none ui:[&>*:not(:first-child)]:border-t-0 ui:[&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      className={cn(
        'ui:flex ui:items-center ui:gap-2 ui:rounded-md ui:border ui:bg-muted ui:px-4 ui:text-sm ui:font-medium ui:shadow-xs ui:[&_svg]:pointer-events-none ui:[&_svg:not([class*=size-])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'ui:relative ui:m-0! ui:self-stretch ui:bg-input ui:data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
