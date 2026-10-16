import { useTranslation } from '@/shared/utils/i18n';
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
  AVAILABLE_FIELD_TYPES_BY_TYPE,
  fieldTypeLabelKeys,
  selectedFieldAtom,
  updateProjectFieldAction,
} from '../../models';

export const FieldPropertiesPanel = reatomComponent(
  function FieldPropertiesPanel() {
    const { t } = useTranslation();

    const field = selectedFieldAtom();

    if (!field) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t('projectDefinition.properties.title')}</CardTitle>
          </CardHeader>
          <CardContent>
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

    const meta = AVAILABLE_FIELD_TYPES_BY_TYPE[field.type];

    const handleValidationChange = (key: 'min' | 'max', rawValue: string) => {
      const value = rawValue === '' ? undefined : Number(rawValue);

      updateProjectFieldAction(field.id, {
        validation: { ...field.validation, [key]: value },
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('projectDefinition.properties.title')}</CardTitle>
          <CardDescription>{t(fieldTypeLabelKeys[field.type])}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-4 sm:col-span-2">
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
          </div>

          {meta.supportsValidation && (
            <>
              <Field>
                <FieldLabel htmlFor={`project-field-min-${field.id}`}>
                  {t('projectDefinition.properties.validation.min')}
                </FieldLabel>
                <Input
                  id={`project-field-min-${field.id}`}
                  type="number"
                  value={field.validation.min ?? ''}
                  placeholder={t(
                    'projectDefinition.properties.validation.minPlaceholder',
                  )}
                  onChange={(event) =>
                    handleValidationChange('min', event.target.value)
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`project-field-max-${field.id}`}>
                  {t('projectDefinition.properties.validation.max')}
                </FieldLabel>
                <Input
                  id={`project-field-max-${field.id}`}
                  type="number"
                  value={field.validation.max ?? ''}
                  placeholder={t(
                    'projectDefinition.properties.validation.maxPlaceholder',
                  )}
                  onChange={(event) =>
                    handleValidationChange('max', event.target.value)
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <FieldDescription>
                  {t('projectDefinition.properties.validation.description')}
                </FieldDescription>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  },
  'FieldPropertiesPanel',
);
