import React, { useEffect } from 'react';

import { GroupSelectorField, UserSelectorField } from '@/modules/user';
import {
  DatePickerFormField,
  DurationPickerFormField,
  TextFormField,
} from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldGroup } from '@repo/ui-kit/components/common/form/field';

import { createDefenseSessionForm } from '../../models/create-defense-session-model';

interface CreateDefenseSessionFormProps {
  onSuccess?: () => void;
  initialDate?: Date;
  roundId: string;
}

export const CreateDefenseSessionForm = reatomComponent(
  function CreateDefenseSessionForm({
    onSuccess,
    roundId,
    initialDate,
  }: CreateDefenseSessionFormProps) {
    const { t } = useTranslation();
    const { submit, fields } = createDefenseSessionForm;

    useEffect(() => {
      if (initialDate) {
        fields.date.set(initialDate.toISOString());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDate]);

    useEffect(() => {
      if (roundId) {
        fields.allocationRoundId.set(roundId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roundId]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      submit().then(() => onSuccess?.());
    };

    return (
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <DatePickerFormField
            field={fields.date}
            label={t('defense.session.form.dateLabel')}
            mode="datetime"
            placeholder={t('defense.session.form.datePlaceholder')}
          />

          <DurationPickerFormField
            field={fields.duration}
            label={t('defense.session.form.durationLabel')}
          />

          <TextFormField
            field={fields.capacity}
            label={t('defense.session.form.capacityLabel')}
            placeholder={t('defense.session.form.capacityPlaceholder')}
            type="number"
            min={1}
            autoComplete="off"
          />

          <UserSelectorField
            field={fields.allowedStudentIds}
            label={t('defense.session.form.allowedStudentsLabel')}
          />

          <GroupSelectorField
            field={fields.allowedGroupIds}
            label={t('defense.session.form.groupsLabel')}
          />

          <Field>
            <Button type="submit" disabled={!submit.ready()}>
              {!submit.ready() ? (
                <CircleNotchIcon className="animate-spin" />
              ) : (
                t('defense.session.form.submitButton')
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  },
);
