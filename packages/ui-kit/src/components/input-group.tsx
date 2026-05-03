import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { Button } from './common/data-display/button';
import { Input } from './common/form/input';
import { Textarea } from './common/form/textarea';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'ui:group/input-group ui:relative ui:flex ui:w-full ui:items-center ui:rounded-md ui:border ui:border-input ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none ui:dark:bg-input/30',
        'ui:h-9 ui:min-w-0 ui:has-[>textarea]:h-auto',

        // Variants based on alignment.
        'ui:has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'ui:has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'ui:has-[>[data-align=block-start]]:h-auto ui:has-[>[data-align=block-start]]:flex-col ui:has-[>[data-align=block-start]]:[&>input]:pb-3',
        'ui:has-[>[data-align=block-end]]:h-auto ui:has-[>[data-align=block-end]]:flex-col ui:has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Focus state.
        'ui:has-[[data-slot=input-group-control]:focus-visible]:border-ring ui:has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] ui:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50',

        // Error state.
        'ui:has-[[data-slot][aria-invalid=true]]:border-destructive ui:has-[[data-slot][aria-invalid=true]]:ring-destructive/20 ui:dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  'ui:flex ui:h-auto ui:cursor-text ui:items-center ui:justify-center ui:gap-2 ui:py-1.5 ui:text-sm ui:font-medium ui:text-muted-foreground ui:select-none ui:group-data-[disabled=true]/input-group:opacity-50 ui:[&>kbd]:rounded-[calc(var(--radius)-5px)] ui:[&>svg:not([class*=size-])]:size-4',
  {
    variants: {
      align: {
        'inline-start':
          'ui:order-first ui:pl-3 ui:has-[>button]:ml-[-0.45rem] ui:has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'ui:order-last ui:pr-3 ui:has-[>button]:mr-[-0.45rem] ui:has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          'ui:order-first ui:w-full ui:justify-start ui:px-3 ui:pt-3 ui:group-has-[>input]/input-group:pt-2.5 ui:[.border-b]:pb-3',
        'block-end':
          'ui:order-last ui:w-full ui:justify-start ui:px-3 ui:pb-3 ui:group-has-[>input]/input-group:pb-2.5 ui:[.border-t]:pt-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'ui:flex ui:items-center ui:gap-2 ui:text-sm ui:shadow-none',
  {
    variants: {
      size: {
        xs: 'ui:h-6 ui:gap-1 ui:rounded-[calc(var(--radius)-5px)] ui:px-2 ui:has-[>svg]:px-2 ui:[&>svg:not([class*=size-])]:size-3.5',
        sm: 'ui:h-8 ui:gap-1.5 ui:rounded-md ui:px-2.5 ui:has-[>svg]:px-2.5',
        'icon-xs':
          'ui:size-6 ui:rounded-[calc(var(--radius)-5px)] ui:p-0 ui:has-[>svg]:p-0',
        'icon-sm': 'ui:size-8 ui:p-0 ui:has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'ui:flex ui:items-center ui:gap-2 ui:text-sm ui:text-muted-foreground ui:[&_svg]:pointer-events-none ui:[&_svg:not([class*=size-])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'ui:flex-1 ui:rounded-none ui:border-0 ui:bg-transparent ui:shadow-none ui:focus-visible:ring-0 ui:dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'ui:flex-1 ui:resize-none ui:rounded-none ui:border-0 ui:bg-transparent ui:py-3 ui:shadow-none ui:focus-visible:ring-0 ui:dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
