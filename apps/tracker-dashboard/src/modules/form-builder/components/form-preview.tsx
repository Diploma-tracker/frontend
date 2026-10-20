import { useMemo, useState } from 'react';

import {
  createProjectFieldsAjv,
  jsonFormsRenderers,
} from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { JsonForms } from '@jsonforms/react';
import { FilesIcon } from '@phosphor-icons/react';
import { reatomComponent, useAtom } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';

import {
  builderOutput,
  fieldsAtom,
  previewDataAtom,
} from '../model/builder-state';

/** Мінімальний вигляд AJV ErrorObject, який нам потрібен. */
interface SchemaError {
  instancePath: string;
  message?: string;
}

interface FormPreviewProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

/**
 * Extracts the first segment of an AJV `instancePath` (e.g. `/title` → `title`).
 * Root-level errors have an empty path and yield `null`.
 */
const errorField = (error: SchemaError): string | null => {
  const segment = error.instancePath.split('/').filter(Boolean)[0];
  return segment ?? null;
};

export const FormPreview = reatomComponent(function FormPreview({
  onSubmit,
}: FormPreviewProps) {
  const { t } = useTranslation();
  const [data, setData] = useAtom(previewDataAtom);
  const [errors, setErrors] = useState<SchemaError[]>([]);

  const fields = fieldsAtom();
  const { schema, uischema } = builderOutput();

  const ajv = useMemo(() => createProjectFieldsAjv(), []);

  const fieldNames = useMemo(
    () => new Set(fields.map((f) => f.name)),
    [fields],
  );

  /**
   * Помилки, які жоден Control не підхопив (root-рівень схеми, напр. `anyOf`
   * для крос-польового правила). JsonForms показує per-field помилки сам;
   * ці — показуємо summary-блоком.
   */
  const unhandledErrors = useMemo(
    () =>
      errors.filter((error) => {
        const field = errorField(error);
        return field === null || !fieldNames.has(field);
      }),
    [errors, fieldNames],
  );

  if (uischema.elements.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyMedia variant="icon">
            <FilesIcon />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('formBuilder.preview.emptyTitle')}</EmptyTitle>
            <EmptyDescription>
              {t('formBuilder.preview.emptyDescription')}
            </EmptyDescription>
          </EmptyHeader>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="rounded-xl border bg-card p-6">
        <JsonForms
          data={data}
          schema={schema}
          uischema={uischema}
          renderers={jsonFormsRenderers}
          ajv={ajv}
          validationMode="ValidateAndShow"
          onChange={(state) => {
            setData(state.data ?? {});
            setErrors((state.errors ?? []) as SchemaError[]);
          }}
        />
      </div>

      {unhandledErrors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-destructive">
            {t('formBuilder.preview.crossFieldError')}
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

      <Button
        type="button"
        variant="solid"
        intent="primary"
        className="ui:w-fit"
        disabled={!onSubmit}
        onClick={() => onSubmit?.(data)}
      >
        {t('formBuilder.preview.submit')}
      </Button>
    </div>
  );
});
