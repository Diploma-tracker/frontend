import React, { useEffect } from 'react';

import { GroupsSelectorField, UsersSelectorField } from '@/modules/user';
import {
  DatePickerFormField,
  DurationPickerFormField,
  TextFormField,
} from '@/shared/components';
import { setArrayField } from '@/shared/model';
import { useQuery } from '@/shared/model/query';
import { useTranslation } from '@/shared/utils/i18n';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldGroup } from '@repo/ui-kit/components/common/form/field';

import { defenseSessionDetailsQuery } from '../../models';
import { updateDefenseSessionForm } from '../../models/update-defense-session-model';

interface EditDefenseSessionFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

export const EditDefenseSessionForm = reatomComponent(
  function EditDefenseSessionForm({
    sessionId,
    onSuccess,
  }: EditDefenseSessionFormProps) {
    const { t } = useTranslation();
    const { submit, fields } = updateDefenseSessionForm;
    const { data } = useQuery(defenseSessionDetailsQuery, sessionId);
    const session = data();

    useEffect(() => {
      if (session) {
        fields.sessionId.set(session.id);
        fields.date.set(session.date);
        fields.duration.set(session.duration);
        fields.capacity.set(String(session.capacity));
        setArrayField(
          fields.allowedStudentIds,
          session.allowedStudents?.map((s) => s.id) ?? [],
        );
        setArrayField(
          fields.allowedGroupIds,
          session.allowedGroups?.map((g) => g.id) ?? [],
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.id]);

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

          <UsersSelectorField
            field={fields.allowedStudentIds}
            label={t('defense.session.form.allowedStudentsLabel')}
          />

          <GroupsSelectorField
            field={fields.allowedGroupIds}
            label={t('defense.session.form.groupsLabel')}
          />

          <Field>
            <Button type="submit" disabled={!submit.ready()}>
              {!submit.ready() ? (
                <CircleNotchIcon className="animate-spin" />
              ) : (
                t('defense.session.detail.rescheduleSubmit')
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  },
);
