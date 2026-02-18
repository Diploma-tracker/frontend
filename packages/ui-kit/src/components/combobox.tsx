'use client';

import * as React from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { CheckIcon, CaretDownIcon, XIcon } from '@phosphor-icons/react';

import { cn } from '../lib/utils';
import { Button } from './common/data-display/button';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn('ui:[&_svg:not([class*=size-])]:size-4', className)}
      {...props}
    >
      {children}
      <CaretDownIcon
        data-slot="combobox-trigger-icon"
        className="ui:pointer-events-none ui:size-4 ui:text-muted-foreground"
      />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="ui:pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn('ui:w-auto', className)}>
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="ui:group-has-data-[slot=combobox-clear]/input-group:hidden ui:data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="ui:isolate ui:z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            'ui:group/combobox-content ui:relative ui:max-h-96 ui:w-(--anchor-width) ui:max-w-(--available-width) ui:min-w-[calc(var(--anchor-width)+--spacing(7))] ui:origin-(--transform-origin) ui:overflow-hidden ui:rounded-md ui:bg-popover ui:text-popover-foreground ui:shadow-md ui:ring-1 ui:ring-foreground/10 ui:duration-100 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-closed:zoom-out-95 ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-open:zoom-in-95 ui:data-[chips=true]:min-w-(--anchor-width) ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:*:data-[slot=input-group]:m-1 ui:*:data-[slot=input-group]:mb-0 ui:*:data-[slot=input-group]:h-8 ui:*:data-[slot=input-group]:border-input/30 ui:*:data-[slot=input-group]:bg-input/30 ui:*:data-[slot=input-group]:shadow-none',
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        'ui:max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] ui:scroll-py-1 ui:overflow-y-auto ui:p-1 ui:data-empty:p-0',
        className
      )}
      {...props}
    />
  );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        'ui:relative ui:flex ui:w-full ui:cursor-default ui:items-center ui:gap-2 ui:rounded-sm ui:py-1.5 ui:pr-8 ui:pl-2 ui:text-sm ui:outline-hidden ui:select-none ui:data-disabled:pointer-events-none ui:data-disabled:opacity-50 ui:data-highlighted:bg-accent ui:data-highlighted:text-accent-foreground ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4',
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        render={
          <span className="ui:pointer-events-none ui:absolute ui:right-2 ui:flex ui:size-4 ui:items-center ui:justify-center" />
        }
      >
        <CheckIcon className="ui:pointer-events-none ui:size-4 ui:pointer-coarse:size-5" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />;
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        'ui:px-2 ui:py-1.5 ui:text-xs ui:text-muted-foreground ui:pointer-coarse:px-3 ui:pointer-coarse:py-2 ui:pointer-coarse:text-sm',
        className
      )}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        'ui:hidden ui:w-full ui:justify-center ui:py-2 ui:text-center ui:text-sm ui:text-muted-foreground ui:group-data-empty/combobox-content:flex',
        className
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn('ui:-mx-1 ui:my-1 ui:h-px ui:bg-border', className)}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        'ui:flex ui:min-h-9 ui:flex-wrap ui:items-center ui:gap-1.5 ui:rounded-md ui:border ui:border-input ui:bg-transparent ui:bg-clip-padding ui:px-2.5 ui:py-1.5 ui:text-sm ui:shadow-xs ui:transition-[color,box-shadow] ui:focus-within:border-ring ui:focus-within:ring-[3px] ui:focus-within:ring-ring/50 ui:has-aria-invalid:border-destructive ui:has-aria-invalid:ring-[3px] ui:has-aria-invalid:ring-destructive/20 ui:has-data-[slot=combobox-chip]:px-1.5 ui:dark:bg-input/30 ui:dark:has-aria-invalid:border-destructive/50 ui:dark:has-aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        'ui:flex ui:h-[calc(--spacing(5.5))] ui:w-fit ui:items-center ui:justify-center ui:gap-1 ui:rounded-sm ui:bg-muted ui:px-1.5 ui:text-xs ui:font-medium ui:whitespace-nowrap ui:text-foreground ui:has-disabled:pointer-events-none ui:has-disabled:cursor-not-allowed ui:has-disabled:opacity-50 ui:has-data-[slot=combobox-chip-remove]:pr-0',
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="ui:-ml-1 ui:opacity-50 ui:hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="ui:pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn('ui:min-w-16 ui:flex-1 ui:outline-none', className)}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
