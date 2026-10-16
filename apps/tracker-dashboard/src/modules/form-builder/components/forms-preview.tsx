import type { ComponentProps } from 'react';
import { useMeasure } from 'react-use';

import { jsonFormsRenderers } from '@/shared/components/json-forms';
import type { JsonSchema, Layout } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';

import { cn } from '@repo/ui-kit/lib/utils';

/** Any CSS length: a number is treated as px, a string may carry any unit. */
type CssLength = number | string;

/**
 * A form attached to a project definition: the name shown on cards plus the
 * JSON Forms pair the builder produces for it. A project definition can hold
 * several forms, so each one is identified separately.
 */
export interface FormPreviewDefinition {
  id: string;
  name: string;
  schema: JsonSchema;
  uischema: Layout;
}

export const FORM_PREVIEW_REAL_SIZE: CssLength = 400;

export const FORM_PREVIEW_PADDING: CssLength = '1rem';

const toCssLength = (value: CssLength) =>
  typeof value === 'number' ? `${value}px` : value;

/**
 * `calc()` can divide two lengths only where the browser has typed CSS
 * arithmetic (Chrome 128+, Safari 18.2+, Firefox 155+); without it the scale
 * has to be measured instead.
 */
const supportsCssUnitDivision = () => {
  try {
    return (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('container-type', 'inline-size') &&
      CSS.supports('transform', 'scale(calc(100cqw / 400px))')
    );
  } catch {
    return false;
  }
};

/** `100cqw` is the square, so this is `square width / padded form width`. */
const cssScale = (realSize: CssLength, padding: CssLength) =>
  `scale(calc(100cqw / (${toCssLength(realSize)} + ${toCssLength(padding)} * 2)))`;

interface FormsPreviewProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The form to preview. */
  definition: FormPreviewDefinition;
  /** Form natural width before scaling. Defaults to `FORM_PREVIEW_REAL_SIZE`. */
  realSize?: CssLength;
  /**
   * Gap between the form and the square's edge. Applied before scaling (the
   * padding is part of the scaled layout), so it renders as `scale × padding`.
   * Defaults to `FORM_PREVIEW_PADDING`.
   */
  padding?: CssLength;
}

/**
 * The card a form is previewed as: a square (sized by `className`, so it can be
 * fixed or responsive) showing the form at its natural width, scaled down and
 * clipped under a gradient with the name on top. The scale is `square width /
 * padded form width`, computed in CSS where possible and measured with
 * `ResizeObserver` otherwise.
 */
export const FormsPreview = function FormsPreview({
  definition,
  realSize = FORM_PREVIEW_REAL_SIZE,
  padding = FORM_PREVIEW_PADDING,
  className,
  style,
  ...props
}: FormsPreviewProps) {
  /* Hooks stay unconditional; on the CSS path the refs are never attached. */
  const [boxRef, boxRect] = useMeasure<HTMLDivElement>();
  const [formRef, formRect] = useMeasure<HTMLDivElement>();

  const cssDivision = supportsCssUnitDivision();

  const measuredScale =
    boxRect.width > 0 && formRect.width > 0
      ? boxRect.width / formRect.width
      : 0;

  const transform = cssDivision
    ? cssScale(realSize, padding)
    : `scale(${measuredScale})`;

  return (
    <div
      style={cssDivision ? { containerType: 'inline-size', ...style } : style}
      className={cn(
        'relative aspect-square overflow-hidden border bg-card shadow-sm',
        className,
      )}
      {...props}
    >
      <div ref={cssDivision ? undefined : boxRef} className="absolute inset-0">
        {/*
         * The padded box is the shrink-wrapped child, so its width is exactly
         * `realSize` + both paddings — the same width the CSS `calc` assumes.
         * A still image: nothing inside may take focus or a pointer event, and
         * validation is off so the empty form is not shown as all-invalid.
         */}
        <div
          ref={cssDivision ? undefined : formRef}
          aria-hidden
          className="pointer-events-none w-fit origin-top-left select-none"
          style={{ transform }}
        >
          <div style={{ padding, width: realSize, boxSizing: 'content-box' }}>
            <JsonForms
              data={{}}
              schema={definition.schema}
              uischema={definition.uischema}
              renderers={jsonFormsRenderers}
              readonly
              validationMode="NoValidation"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-card via-card/80 to-card/40" />

      <span className="absolute right-2 bottom-2 left-2 line-clamp-3 text-sm font-medium">
        {definition.name}
      </span>
    </div>
  );
};
