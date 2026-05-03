import * as React from 'react';

import { HoverCard as HoverCardPrimitive } from 'radix-ui';

import { cn } from '../../../lib/utils';

function HoverCard({
  openDelay = 400,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      {...props}
    />
  );
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'ui:z-50 ui:w-64 ui:origin-(--radix-hover-card-content-transform-origin) ui:rounded-md ui:border ui:bg-popover ui:p-4 ui:text-popover-foreground ui:shadow-md ui:outline-hidden ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:animate-in ui:data-[state=open]:fade-in-0 ui:data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
