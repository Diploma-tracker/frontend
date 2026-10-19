import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';

import { setSelectedRoles } from '../../model/actions/tasks';
import { TASK_ROLE_OPTIONS } from '../../model/definitions/task-definitions';

export interface RolesFieldProps {
  selectedRoles: string[];
}

export const RolesField = reatomComponent(function RolesField({
  selectedRoles,
}: RolesFieldProps) {
  const { t } = useTranslation();

  const toggle = (value: string) => {
    const next = selectedRoles.includes(value)
      ? selectedRoles.filter((role) => role !== value)
      : [...selectedRoles, value];

    setSelectedRoles(next);
  };

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.roles')}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {TASK_ROLE_OPTIONS.map((role) => {
          const active = selectedRoles.includes(role.value);

          return (
            <Button
              key={role.value}
              type="button"
              variant={active ? 'solid' : 'outline'}
              intent={active ? 'primary' : 'neutral'}
              size="xs"
              aria-pressed={active}
              onClick={() => toggle(role.value)}
            >
              {t(role.labelKey)}
            </Button>
          );
        })}
      </div>
    </Field>
  );
});
