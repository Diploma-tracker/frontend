import { useTranslation } from '@/shared/utils/i18n';

import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';
import {
  Field,
  FieldContent,
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
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';

import type {
  FieldInstance,
  FieldInstanceProps,
} from '../model/schema-generator';

interface PropertiesPanelProps {
  field: FieldInstance | null;
  onUpdate: (instanceId: string, patch: Partial<FieldInstanceProps>) => void;
}

export const PropertiesPanel = function PropertiesPanel({
  field,
  onUpdate,
}: PropertiesPanelProps) {
  const { t } = useTranslation();

  if (!field) {
    return (
      <Card>
        <CardContent className="p-0">
          <Empty className="border-none">
            <EmptyContent>
              <EmptyTitle>{t('formBuilder.properties.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('formBuilder.properties.emptyDescription')}
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  const update = (patch: Partial<FieldInstanceProps>) =>
    onUpdate(field.instanceId, patch);

  const hasPlaceholder = field.kind !== 'boolean' && field.kind !== 'file';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('formBuilder.properties.title')}</CardTitle>
        <CardDescription>{field.props.label}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <Field orientation="vertical">
          <FieldLabel>{t('formBuilder.properties.label')}</FieldLabel>
          <Input
            aria-label={t('formBuilder.properties.label')}
            value={field.props.label}
            placeholder={t('formBuilder.properties.labelPlaceholder')}
            onChange={(event) => update({ label: event.target.value })}
          />
        </Field>

        {hasPlaceholder && (
          <Field orientation="vertical">
            <FieldLabel>{t('formBuilder.properties.placeholder')}</FieldLabel>
            <Input
              aria-label={t('formBuilder.properties.placeholder')}
              value={field.props.placeholder ?? ''}
              placeholder={t('formBuilder.properties.placeholderHint')}
              onChange={(event) =>
                update({ placeholder: event.target.value || undefined })
              }
            />
          </Field>
        )}

        <Field orientation="horizontal">
          <Checkbox
            checked={field.props.required}
            onCheckedChange={(checked) =>
              update({ required: checked === true })
            }
          />
          <FieldContent>
            <FieldLabel>{t('formBuilder.properties.required')}</FieldLabel>
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
};
