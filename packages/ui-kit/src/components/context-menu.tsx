import * as React from 'react';

import { CaretRightIcon, CheckIcon, CircleIcon } from '@phosphor-icons/react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'ui:flex ui:cursor-default ui:items-center ui:rounded-sm ui:px-2 ui:py-1.5 ui:text-sm ui:outline-hidden ui:select-none ui:focus:bg-accent ui:focus:text-accent-foreground ui:data-inset:pl-8 ui:data-[state=open]:bg-accent ui:data-[state=open]:text-accent-foreground ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4 ui:[&_svg:not([class*=text-])]:text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
      <CaretRightIcon className="ui:ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        'ui:z-50 ui:min-w-32 ui:origin-(--radix-context-menu-content-transform-origin) ui:overflow-hidden ui:rounded-md ui:border ui:bg-popover ui:p-1 ui:text-popover-foreground ui:shadow-lg ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:animate-in ui:data-[state=open]:fade-in-0 ui:data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          'ui:z-50 ui:max-h-(--radix-context-menu-content-available-height) ui:min-w-32 ui:origin-(--radix-context-menu-content-transform-origin) ui:overflow-x-hidden ui:overflow-y-auto ui:rounded-md ui:border ui:bg-popover ui:p-1 ui:text-popover-foreground ui:shadow-md ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:animate-in ui:data-[state=open]:fade-in-0 ui:data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        'ui:relative ui:flex ui:cursor-default ui:items-center ui:gap-2 ui:rounded-sm ui:px-2 ui:py-1.5 ui:text-sm ui:outline-hidden ui:select-none ui:focus:bg-accent ui:focus:text-accent-foreground ui:data-disabled:pointer-events-none ui:data-disabled:opacity-50 ui:data-inset:pl-8 ui:data-[variant=destructive]:text-destructive ui:data-[variant=destructive]:focus:bg-destructive/10 ui:data-[variant=destructive]:focus:text-destructive ui:dark:data-[variant=destructive]:focus:bg-destructive/20 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4 ui:[&_svg:not([class*=text-])]:text-muted-foreground ui:data-[variant=destructive]:*:[svg]:text-destructive!',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        'ui:relative ui:flex ui:cursor-default ui:items-center ui:gap-2 ui:rounded-sm ui:py-1.5 ui:pr-2 ui:pl-8 ui:text-sm ui:outline-hidden ui:select-none ui:focus:bg-accent ui:focus:text-accent-foreground ui:data-disabled:pointer-events-none ui:data-disabled:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="ui:pointer-events-none ui:absolute ui:left-2 ui:flex ui:size-3.5 ui:items-center ui:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="ui:size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        'ui:relative ui:flex ui:cursor-default ui:items-center ui:gap-2 ui:rounded-sm ui:py-1.5 ui:pr-2 ui:pl-8 ui:text-sm ui:outline-hidden ui:select-none ui:focus:bg-accent ui:focus:text-accent-foreground ui:data-disabled:pointer-events-none ui:data-disabled:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4',
        className,
      )}
      {...props}
    >
      <span className="ui:pointer-events-none ui:absolute ui:left-2 ui:flex ui:size-3.5 ui:items-center ui:justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="ui:size-2 ui:fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        'ui:px-2 ui:py-1.5 ui:text-sm ui:font-medium ui:text-foreground ui:data-inset:pl-8',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('ui:-mx-1 ui:my-1 ui:h-px ui:bg-border', className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'ui:ml-auto ui:text-xs ui:tracking-widest ui:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
