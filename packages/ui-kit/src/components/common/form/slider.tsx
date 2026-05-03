import * as React from 'react';

import { Slider as SliderPrimitive } from 'radix-ui';

import { cn } from '../../../lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'ui:relative ui:flex ui:w-full ui:touch-none ui:items-center ui:select-none ui:data-disabled:opacity-50 ui:data-[orientation=vertical]:h-full ui:data-[orientation=vertical]:min-h-44 ui:data-[orientation=vertical]:w-auto ui:data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'ui:relative ui:grow ui:overflow-hidden ui:rounded-full ui:bg-muted ui:data-[orientation=horizontal]:h-1.5 ui:data-[orientation=horizontal]:w-full ui:data-[orientation=vertical]:h-full ui:data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'ui:absolute ui:bg-primary ui:data-[orientation=horizontal]:h-full ui:data-[orientation=vertical]:w-full',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="ui:block ui:size-4 ui:shrink-0 ui:rounded-full ui:border ui:border-primary ui:bg-white ui:shadow-sm ui:ring-ring/50 ui:transition-[color,box-shadow] ui:hover:ring-4 ui:focus-visible:ring-4 ui:focus-visible:outline-hidden ui:disabled:pointer-events-none ui:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
