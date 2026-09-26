import { useTranslation } from '@/shared/utils/i18n';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';

import type {
  FieldInstance,
  FieldInstanceProps,
} from '../model/schema-generator';

interface PropertiesPanelProps {
  field: FieldInstance;
  onBack: () => void;
  onUpdate: (instanceId: string, patch: Partial<FieldInstanceProps>) => void;
}

export const PropertiesPanel = reatomComponent(function PropertiesPanel({
  field,
  onBack,
  onUpdate,
}: PropertiesPanelProps) {
  const { t } = useTranslation();

  const update = (patch: Partial<FieldInstanceProps>) =>
    onUpdate(field.instanceId, patch);

  const hasPlaceholder = field.kind !== 'boolean' && field.kind !== 'file';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('formBuilder.properties.title')}</CardTitle>
        <CardDescription>{field.props.label}</CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            intent="neutral"
            aria-label={t('formBuilder.properties.back')}
            onClick={onBack}
          >
            <ArrowLeftIcon />
          </Button>
        </CardAction>
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
});
