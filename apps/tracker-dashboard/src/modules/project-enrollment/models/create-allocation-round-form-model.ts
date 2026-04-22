import { action, reatomForm, withAsync, wrap } from '@reatom/core';
import i18n from 'i18next';
import { z } from 'zod';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { fetchCreateAllocationRound } from '../api';

const t = (key: string) => i18n.t(key);

const schema = z
  .object({
    name: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.nameRequired')),
    start_at: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.startDateRequired')),
    end_at: z.string().min(1, t('projectEnrollment.allocationRound.form.validation.endDateRequired')),
  })
  .refine((data) => new Date(data.end_at) > new Date(data.start_at), {
    message: t('projectEnrollment.allocationRound.form.validation.endDateAfterStart'),
    path: ['end_at'],
  });

export type CreateAllocationRoundFormValues = z.infer<typeof schema>;

export const createAllocationRoundAction = action(async (dto: CreateAllocationRoundFormValues) => {
  const response = await wrap(
    fetchCreateAllocationRound({
      name: dto.name,
      start_at: new Date(dto.start_at).toISOString(),
      end_at: new Date(dto.end_at).toISOString(),
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
    start_at: '',
    end_at: '',
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
