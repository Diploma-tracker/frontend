import { t } from '@/shared/utils/i18n';
import { action, atom, reatomForm, withAsync, wrap } from '@reatom/core';
import { z } from 'zod';

import { thesisDefenseSession } from '@repo/api';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

// --- Mock data (replace with API calls when available) ---

export interface UserOption {
  value: string;
  label: string;
}

export interface GroupOption {
  value: string;
  label: string;
}

export const MOCK_USERS: UserOption[] = [
  { value: 'user-1', label: 'Alice Johnson' },
  { value: 'user-2', label: 'Bob Smith' },
  { value: 'user-3', label: 'Carol Williams' },
  { value: 'user-4', label: 'David Brown' },
  { value: 'user-5', label: 'Eva Davis' },
];

export const MOCK_GROUPS: GroupOption[] = [
  { value: 'group-1', label: 'Group A' },
  { value: 'group-2', label: 'Group B' },
  { value: 'group-3', label: 'Group C' },
  { value: 'group-4', label: 'Group D' },
];

// --- Async loaders (mock; replace with real API calls) ---

const simulateDelay = (ms = 150) => new Promise<void>((r) => setTimeout(r, ms));

export async function loadUserOptions(query: string): Promise<UserOption[]> {
  await simulateDelay();
  const q = query.toLowerCase();
  return MOCK_USERS.filter((u) => u.label.toLowerCase().includes(q));
}

export async function loadGroupOptions(query: string): Promise<GroupOption[]> {
  await simulateDelay();
  const q = query.toLowerCase();
  return MOCK_GROUPS.filter((g) => g.label.toLowerCase().includes(q));
}

export function getUserLabel(value: string): string {
  return MOCK_USERS.find((u) => u.value === value)?.label ?? value;
}

export function getGroupLabel(value: string): string {
  return MOCK_GROUPS.find((g) => g.value === value)?.label ?? value;
}

// --- Form fields exposed for external use (e.g., user module) ---

export const allowedStudentIdsField = atom<string[]>([], 'allowedStudentIdsField');
export const allowedGroupIdsField = atom<string[]>([], 'allowedGroupIdsField');

// --- Zod schema ---

const schema = z.object({
  allocationRoundId: z.string().min(1, t('defense.session.form.validation.allocationRoundRequired')),
  date: z.string().min(1, t('defense.session.form.validation.dateRequired')),
  duration: z.string().min(1, t('defense.session.form.validation.durationRequired')),
  capacity: z
    .string()
    .min(1, t('defense.session.form.validation.capacityRequired'))
    .refine((v) => Number(v) > 0, { message: t('defense.session.form.validation.capacityPositive') }),
  allowedStudentIds: z.array(z.string()),
  allowedGroupIds: z.array(z.string()),
});

export type CreateDefenseSessionFormValues = z.infer<typeof schema>;

// --- Submit action ---

export const createDefenseSessionAction = action(async (dto: CreateDefenseSessionFormValues) => {
  const response = await wrap(
    thesisDefenseSession.createDefenseSession({
      allocationRoundId: dto.allocationRoundId,
      date: new Date(dto.date).toISOString(),
      duration: dto.duration,
      capacity: Number(dto.capacity),
      allowedStudentIds: dto.allowedStudentIds.length > 0 ? dto.allowedStudentIds : undefined,
      allowedGroupIds: dto.allowedGroupIds.length > 0 ? dto.allowedGroupIds : undefined,
    })
  );

  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.form.toast.createError'));
  }

  return response.data;
}, 'createDefenseSessionAction').extend(withAsync());

// --- reatomForm ---

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
        // Sync standalone atoms back to initial state on success
        allowedStudentIdsField.set([]);
        allowedGroupIdsField.set([]);
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
  }
);
