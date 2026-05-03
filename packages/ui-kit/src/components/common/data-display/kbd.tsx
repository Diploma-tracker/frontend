import { cn } from '../../../lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'ui:pointer-events-none ui:inline-flex ui:h-5 ui:w-fit ui:min-w-5 ui:items-center ui:justify-center ui:gap-1 ui:rounded-sm ui:bg-muted ui:px-1 ui:font-sans ui:text-xs ui:font-medium ui:text-muted-foreground ui:select-none',
        'ui:[&_svg:not([class*=size-])]:size-3',
        'ui:in-data-[slot=tooltip-content]:bg-background/20 ui:in-data-[slot=tooltip-content]:text-background ui:dark:in-data-[slot=tooltip-content]:bg-background/10',
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('ui:inline-flex ui:items-center ui:gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
