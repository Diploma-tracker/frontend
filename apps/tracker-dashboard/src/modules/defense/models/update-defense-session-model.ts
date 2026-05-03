import { t } from '@/shared/utils/i18n';
import { reatomForm, wrap } from '@reatom/core';
import { z } from 'zod';

import { updateDefenseSession } from '@repo/api/thesis-defense-session';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

const schema = z.object({
  sessionId: z.string().min(1),
  date: z.string().min(1, t('defense.session.form.validation.dateRequired')),
  duration: z
    .string()
    .min(1, t('defense.session.form.validation.durationRequired')),
  capacity: z
    .string()
    .min(1, t('defense.session.form.validation.capacityRequired'))
    .refine((v) => Number(v) > 0, {
      message: t('defense.session.form.validation.capacityPositive'),
    }),
  allowedStudentIds: z.array(z.string()),
  allowedGroupIds: z.array(z.string()),
});

export type UpdateDefenseSessionFormValues = z.infer<typeof schema>;

export const updateDefenseSessionForm = reatomForm(
  {
    sessionId: '',
    date: '',
    duration: 'PT1H',
    capacity: '1',
    allowedStudentIds: [] as string[],
    allowedGroupIds: [] as string[],
  },
  {
    onSubmit: async (values) => {
      const response = await wrap(
        updateDefenseSession(values.sessionId, {
          date: values.date,
          duration: values.duration,
          capacity: Number(values.capacity),
          allowedStudentIds: values.allowedStudentIds,
          allowedGroupIds: values.allowedGroupIds,
        }),
      );
      if (!response.ok) {
        toast.error(t('defense.session.toast.updateError'));
        throw new Error(response.error?.message);
      }
      toast.success(t('defense.session.toast.updateSuccess'));
    },
    schema,
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: false,
    name: 'updateDefenseSessionForm',
  },
);
