import { jsonFormsRenderers } from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { JsonForms } from '@jsonforms/react';
import { reatomComponent } from '@reatom/react';

import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';

import {
  type ProjectFieldSettings,
  fieldTypeLabelKeys,
  projectFieldSettingsSchema,
  selectedFieldAtom,
  updateProjectFieldAction,
} from '../../models';

export const FieldPropertiesPanel = reatomComponent(
  function FieldPropertiesPanel() {
    const { t } = useTranslation();

    const field = selectedFieldAtom();

    if (!field) {
      return (
        <Card className="min-h-[25rem]">
          <CardHeader>
            <CardTitle>{t('projectDefinition.properties.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {t('projectDefinition.properties.emptyTitle')}
                </EmptyTitle>
                <EmptyDescription>
                  {t('projectDefinition.properties.emptyDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      );
    }

    const settingsSchema = projectFieldSettingsSchema(field.type);

    return (
      <Card className="min-h-[25rem]">
        <CardHeader>
          <CardTitle>{t('projectDefinition.properties.title')}</CardTitle>
          <CardDescription>{t(fieldTypeLabelKeys[field.type])}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={`project-field-name-${field.id}`}>
              {t('projectDefinition.properties.name.label')}
            </FieldLabel>
            <Input
              id={`project-field-name-${field.id}`}
              value={field.name}
              placeholder={t('projectDefinition.properties.name.placeholder')}
              autoComplete="off"
              onChange={(event) =>
                updateProjectFieldAction(field.id, {
                  name: event.target.value,
                })
              }
            />
            <FieldDescription>
              {t('projectDefinition.properties.name.description')}
            </FieldDescription>
          </Field>

          {settingsSchema ? (
            <>
              <JsonForms
                data={field.settings}
                schema={settingsSchema}
                renderers={jsonFormsRenderers}
                validationMode="ValidateAndShow"
                onChange={(state) =>
                  updateProjectFieldAction(field.id, {
                    settings:
                      (state.data as ProjectFieldSettings | undefined) ?? {},
                  })
                }
              />
              <FieldDescription>
                {t('projectDefinition.properties.settings.description')}
              </FieldDescription>
            </>
          ) : null}
        </CardContent>
      </Card>
    );
  },
  'FieldPropertiesPanel',
);
