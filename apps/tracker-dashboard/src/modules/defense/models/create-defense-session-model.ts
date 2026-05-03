import { t } from '@/shared/utils/i18n';
import { action, reatomForm, withAsync, wrap } from '@reatom/core';
import { z } from 'zod';

import { thesisDefenseSession } from '@repo/api';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

const schema = z.object({
  allocationRoundId: z
    .string()
    .min(1, t('defense.session.form.validation.allocationRoundRequired')),
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

export type CreateDefenseSessionFormValues = z.infer<typeof schema>;

export const createDefenseSessionAction = action(
  async (dto: CreateDefenseSessionFormValues) => {
    const response = await wrap(
      thesisDefenseSession.createDefenseSession({
        allocationRoundId: dto.allocationRoundId,
        date: dto.date,
        duration: dto.duration,
        capacity: Number(dto.capacity),
        allowedStudentIds:
          dto.allowedStudentIds.length > 0 ? dto.allowedStudentIds : undefined,
        allowedGroupIds:
          dto.allowedGroupIds.length > 0 ? dto.allowedGroupIds : undefined,
      }),
    );

    if (!response.ok) {
      throw new Error(
        response.error?.message ?? t('defense.session.form.toast.createError'),
      );
    }

    return response.data;
  },
  'createDefenseSessionAction',
).extend(withAsync());

export const createDefenseSessionForm = reatomForm(
  {
    allocationRoundId: '',
    date: '',
    duration: 'PT1H',
    capacity: '1',
    allowedStudentIds: [] as string[],
    allowedGroupIds: [] as string[],
  },
  {
    onSubmit: async (values) => {
      try {
        await wrap(createDefenseSessionAction(values));
        toast.success(t('defense.session.form.toast.createSuccess'));
      } catch (error) {
        toast.error(t('defense.session.form.toast.createError'));
        throw error;
      }
    },
    schema,
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'createDefenseSessionForm',
  },
);
