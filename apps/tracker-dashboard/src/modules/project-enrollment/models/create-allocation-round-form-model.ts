import { authTokenAtom } from '@/modules/auth';
import { action, reatomForm, withAsync, wrap } from '@reatom/core';
import { z } from 'zod';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { fetchCreateAllocationRound } from '../api';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    start_at: z.string().min(1, 'Start date is required'),
    end_at: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.end_at) > new Date(data.start_at), {
    message: 'End date must be after start date',
    path: ['end_at'],
  });

export type CreateAllocationRoundFormValues = z.infer<typeof schema>;

export const createAllocationRoundAction = action(async (dto: CreateAllocationRoundFormValues) => {
  const token = authTokenAtom();
  const response = await wrap(
    fetchCreateAllocationRound(
      {
        name: dto.name,
        start_at: new Date(dto.start_at).toISOString(),
        end_at: new Date(dto.end_at).toISOString(),
      },
      token
    )
  );

  if (!response.ok) {
    throw new Error(response.error?.message ?? 'Failed to create allocation round');
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
        toast.success('Allocation round created successfully!');
      } catch (error) {
        toast.error('Failed to create allocation round. Please try again.');
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
