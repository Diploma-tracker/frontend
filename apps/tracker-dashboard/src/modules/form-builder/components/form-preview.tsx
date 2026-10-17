import { useMemo } from 'react';

import {
  JsonFormsMarkedFieldsProvider,
  jsonFormsRenderers,
} from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { JsonForms } from '@jsonforms/react';
import { FilesIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

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
  useBuilderPreview,
} from '../model/form-builder-model';

export const FormPreview = reatomComponent(function FormPreview() {
  const { t } = useTranslation();
  const { data, setData, violatedRules, markedPaths } = useBuilderPreview();

  const fields = fieldsAtom();
  const output = builderOutput();

  const labelsByInstanceId = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of fields) {
      map.set(field.instanceId, field.props.label);
    }
    return map;
  }, [fields]);

  if (output.uischema.elements.length === 0) {
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
        <JsonFormsMarkedFieldsProvider paths={markedPaths}>
          <JsonForms
            data={data}
            schema={output.schema}
            uischema={output.uischema}
            renderers={jsonFormsRenderers}
            validationMode="ValidateAndShow"
            onChange={(state) => setData(state.data ?? {})}
          />
        </JsonFormsMarkedFieldsProvider>
      </div>

      {violatedRules.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-destructive">
            {t('formBuilder.preview.crossFieldError')}
          </p>
          <ul className="mt-2 space-y-1 pl-4 text-sm text-destructive">
            {violatedRules.map((rule) => (
              <li key={rule.id} className="list-disc">
                {t('formBuilder.rules.atLeastOneOf', {
                  fields: rule.fieldIds
                    .map((id) => labelsByInstanceId.get(id))
                    .filter((label): label is string => Boolean(label))
                    .join(', '),
                })}
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
        onClick={() => {
          console.debug('[form-builder] submit clicked, values:', data);
        }}
      >
        {t('formBuilder.preview.submit')}
      </Button>
    </div>
  );
});
