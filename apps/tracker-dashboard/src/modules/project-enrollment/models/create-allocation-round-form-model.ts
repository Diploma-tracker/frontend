import { action, reatomForm, withAsync, wrap } from '@reatom/core';
import i18n from 'i18next';
import { z } from 'zod';

import { createAllocationRound } from '@repo/api/allocation-round';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

const t = (key: string) => i18n.t(key);

const schema = z
  .object({
    name: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.nameRequired')),
    startAt: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.startDateRequired')),
    endAt: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.endDateRequired')),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: t('projectEnrollment.allocationRound.form.validation.endDateAfterStart'),
    path: ['endAt'],
  });

export type CreateAllocationRoundFormValues = z.infer<typeof schema>;

export const createAllocationRoundAction = action(async (dto: CreateAllocationRoundFormValues) => {
  const response = await wrap(
    createAllocationRound({
      name: dto.name,
      startAt: new Date(dto.startAt).toISOString(),
      endAt: new Date(dto.endAt).toISOString(),
    })
  );

  if (!response.ok) {
    throw new Error(response.error?.message ?? t('projectEnrollment.allocationRound.form.toast.createError'));
  }

  return response.data;
}, 'createAllocationRoundAction').extend(withAsync());

export const createAllocationRoundForm = reatomForm(
  {
    name: '',
    startAt: '',
    endAt: '',
  },
  {
    onSubmit: async (values) => {
      try {
        await wrap(createAllocationRoundAction(values));
        toast.success(t('projectEnrollment.allocationRound.form.toast.createSuccess'));
      } catch (error) {
        toast.error(t('projectEnrollment.allocationRound.form.toast.createError'));
        throw error;
      }
    },

    schema,
    validateOnChange: false,
    validateOnBlur: false,
    keepErrorOnChange: false,
    resetOnSubmit: true,
    name: 'createAllocationRoundForm',
  }
);
