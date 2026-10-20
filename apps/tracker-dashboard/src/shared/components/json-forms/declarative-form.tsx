import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import type { JsonSchema, Layout } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { cn } from '@repo/ui-kit/lib/utils';

import { createCustomAjv } from './custom-ajv';
import { jsonFormsRenderers } from './register-renderers';

/** Minimal shape of the AJV `ErrorObject`s we care about. */
interface SchemaError {
  instancePath: string;
  message?: string;
}

/**
 * Extracts the first segment of an AJV `instancePath` (e.g. `/title` → `title`).
 * Root-level errors have an empty path and yield `null`.
 */
const errorField = (error: SchemaError): string | null => {
  const segment = error.instancePath.split('/').filter(Boolean)[0];
  return segment ?? null;
};

export interface DeclarativeFormProps {
  /** JSON Schema describing the form data. */
  schema: JsonSchema;
  /** JSON Forms uiSchema (layout of controls). */
  uischema: Layout;
  /** Controlled data. When omitted the form keeps its own state. */
  data?: Record<string, unknown>;
  /** Called on every edit with the current data. */
  onChange?: (data: Record<string, unknown>) => void;
  /**
   * When provided, a submit button is rendered that calls this with the current
   * data. Omit both this and `submitLabel` to render no button.
   */
  onSubmit?: (data: Record<string, unknown>) => void;
  /** Submit button label. Defaults to `common.actions.submit`. */
  submitLabel?: string;
  /** Heading of the summary block for errors no control picked up. */
  crossFieldErrorLabel?: string;
  /** Shown instead of the form when the uiSchema has no elements. */
  emptyState?: ReactNode;
  /** Extra class names for the outer wrapper. */
  className?: string;
}

/**
 * Renders a form from a JSON Schema + uiSchema pair and nothing else. It owns
 * the AJV instance (with the backend's custom `x-*` keywords), collects
 * validation errors, surfaces the root-level ones no control renders, and
 * optionally renders a submit button. Domain-agnostic: all data and text come
 * in through props, so modules and `pages/` can drop it anywhere.
 */
export const DeclarativeForm = function DeclarativeForm({
  schema,
  uischema,
  data,
  onChange,
  onSubmit,
  submitLabel,
  crossFieldErrorLabel,
  emptyState,
  className,
}: DeclarativeFormProps) {
  const { t } = useTranslation();
  const [internalData, setInternalData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<SchemaError[]>([]);

  const currentData = data ?? internalData;
  const ajv = useMemo(() => createCustomAjv(), []);

  const fieldNames = useMemo(
    () => new Set(schema.properties ? Object.keys(schema.properties) : []),
    [schema],
  );

  /**
   * Errors no control picked up (root level, e.g. `anyOf` of a cross-field
   * rule). JsonForms renders per-field errors itself; these become a summary.
   */
  const unhandledErrors = useMemo(
    () =>
      errors.filter((error) => {
        const field = errorField(error);
        return field === null || !fieldNames.has(field);
      }),
    [errors, fieldNames],
  );

  const isEmpty =
    !uischema || !('elements' in uischema) || uischema.elements.length === 0;

  if (isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  const handleChange = (state: {
    data?: Record<string, unknown>;
    errors?: SchemaError[];
  }) => {
    const next = state.data ?? {};
    if (data === undefined) {
      setInternalData(next);
    }
    setErrors(state.errors ?? []);
    onChange?.(next);
  };

  return (
    <div className={cn('flex w-full flex-col gap-4', className)}>
      <div className="rounded-xl border bg-card p-6">
        <JsonForms
          data={currentData}
          schema={schema}
          uischema={uischema}
          renderers={jsonFormsRenderers}
          ajv={ajv}
          validationMode="ValidateAndShow"
          onChange={handleChange}
        />
      </div>

      {unhandledErrors.length > 0 && crossFieldErrorLabel && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-destructive">
            {crossFieldErrorLabel}
          </p>
          <ul className="mt-2 space-y-1 pl-4 text-sm text-destructive">
            {unhandledErrors.map((error, index) => (
              <li key={`${error.instancePath}-${index}`} className="list-disc">
                {error.message ?? error.instancePath}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onSubmit && (
        <Button
          type="button"
          variant="solid"
          intent="primary"
          className="ui:w-fit"
          onClick={() => onSubmit(currentData)}
        >
          {submitLabel ?? t('common.actions.submit')}
        </Button>
      )}
    </div>
  );
};
