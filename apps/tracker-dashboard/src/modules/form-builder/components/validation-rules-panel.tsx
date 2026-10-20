import { useMemo, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';
import {
  Field,
  FieldContent,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
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

import { createRuleId } from '../model/builder-state';
import type { FormField, ValidationRule } from '../model/types';

interface ValidationRulesPanelProps {
  rules: ValidationRule[];
  fields: FormField[];
  onAdd: (rule: ValidationRule) => void;
  onRemove: (ruleId: string) => void;
}

export const ValidationRulesPanel = reatomComponent(
  function ValidationRulesPanel({
    rules,
    fields,
    onAdd,
    onRemove,
  }: ValidationRulesPanelProps) {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedFieldNames, setSelectedFieldNames] = useState<string[]>([]);

    const labelsByName = useMemo(() => {
      const map = new Map<string, string>();
      for (const field of fields) {
        map.set(field.name, field.label);
      }
      return map;
    }, [fields]);

    const toggleField = (name: string) => {
      setSelectedFieldNames((current) =>
        current.includes(name)
          ? current.filter((id) => id !== name)
          : [...current, name],
      );
    };

    const handleCancel = () => {
      setIsAdding(false);
      setSelectedFieldNames([]);
    };

    const handleAdd = () => {
      onAdd({
        id: createRuleId(),
        type: 'one_of_required',
        field_names: selectedFieldNames,
      });
      handleCancel();
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('formBuilder.rules.title')}</CardTitle>
          <CardDescription>
            {t('formBuilder.rules.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {rules.length === 0 && !isAdding ? (
            <Empty className="border-none px-2">
              <EmptyContent>
                <EmptyTitle>{t('formBuilder.rules.emptyTitle')}</EmptyTitle>
                <EmptyDescription>
                  {t('formBuilder.rules.emptyDescription')}
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {rules.map((rule) => {
                const labels = rule.field_names
                  .map((name) => labelsByName.get(name))
                  .filter((label): label is string => Boolean(label));
                return (
                  <div
                    key={rule.id}
                    className="flex items-center gap-2 rounded-md border bg-card px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 text-xs text-muted-foreground">
                      {t('formBuilder.rules.atLeastOneOf', {
                        fields: labels.join(', '),
                      })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      intent="destructive"
                      aria-label={t('formBuilder.rules.removeRule')}
                      onClick={() => onRemove(rule.id)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {isAdding ? (
            <div className="flex flex-col gap-3 rounded-md border border-dashed p-3">
              <p className="text-sm text-muted-foreground">
                {t('formBuilder.rules.ruleHint')}
              </p>

              {fields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t('formBuilder.rules.noFields')}
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {fields.map((field) => {
                    const checked = selectedFieldNames.includes(field.name);
                    return (
                      <Field
                        key={field.name}
                        orientation="horizontal"
                        className="gap-3 rounded-md px-2 py-1"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleField(field.name)}
                        />
                        <FieldContent>
                          <FieldLabel>{field.label}</FieldLabel>
                        </FieldContent>
                      </Field>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="solid"
                  intent="primary"
                  size="sm"
                  disabled={selectedFieldNames.length < 2}
                  onClick={handleAdd}
                >
                  {t('formBuilder.rules.addRuleSubmit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  intent="neutral"
                  size="sm"
                  onClick={handleCancel}
                >
                  {t('formBuilder.rules.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              intent="primary"
              size="sm"
              className="ui:w-full"
              onClick={() => setIsAdding(true)}
            >
              <PlusIcon />
              {t('formBuilder.rules.addRule')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  },
);
