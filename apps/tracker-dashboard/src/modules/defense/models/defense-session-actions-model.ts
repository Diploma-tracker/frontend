import { query } from '@/shared/model/query';
import { t } from '@/shared/utils/i18n';
import { action, withAsync, wrap } from '@reatom/core';

import type { DefenseSessionDetailsDTO } from '@repo/api/model';
import {
  deleteDefenseSession,
  getDefenseSessionDetails,
  registerForDefenseSession,
  rescheduleDefenseSession,
  unregisterFromDefenseSession,
  updateDefenseSession,
} from '@repo/api/thesis-defense-session';
import { toast } from '@repo/ui-kit/components/common/floating/sonner';

export type { DefenseSessionDetailsDTO };

export const deleteDefenseSessionAction = action(async (sessionId: string) => {
  const response = await wrap(deleteDefenseSession(sessionId));
  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.toast.deleteError'));
  }
  return response.data;
}, 'deleteDefenseSessionAction').extend(withAsync({ status: true }));

export interface RescheduleDefenseSessionValues {
  sessionId: string;
  date?: string | null;
  duration?: string | null;
}

export const rescheduleDefenseSessionAction = action(async (values: RescheduleDefenseSessionValues) => {
  const response = await wrap(
    rescheduleDefenseSession(values.sessionId, {
      date: values.date,
      duration: values.duration,
    })
  );
  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.toast.rescheduleError'));
  }
  toast.success(t('defense.session.toast.rescheduleSuccess'));
  return response.data;
}, 'rescheduleDefenseSessionAction').extend(withAsync({ status: true }));

export interface UpdateDefenseSessionValues {
  sessionId: string;
  date?: string | null;
  duration?: string | null;
  capacity?: number | null;
  allowedStudentIds?: string[] | null;
  allowedGroupIds?: string[] | null;
}

export const updateDefenseSessionAction = action(async (values: UpdateDefenseSessionValues) => {
  const response = await wrap(
    updateDefenseSession(values.sessionId, {
      date: values.date,
      duration: values.duration,
      capacity: values.capacity,
      allowedStudentIds: values.allowedStudentIds,
      allowedGroupIds: values.allowedGroupIds,
    })
  );
  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.toast.updateError'));
  }
  toast.success(t('defense.session.toast.updateSuccess'));
  return response.data;
}, 'updateDefenseSessionAction').extend(withAsync({ status: true }));

export const registerForDefenseSessionAction = action(async (sessionId: string) => {
  const response = await wrap(registerForDefenseSession(sessionId, {}));
  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.toast.registerError'));
  }
  toast.success(t('defense.session.toast.registerSuccess'));
  return response.data;
}, 'registerForDefenseSessionAction').extend(withAsync({ status: true }));

export const unregisterFromDefenseSessionAction = action(async (sessionId: string) => {
  const response = await wrap(unregisterFromDefenseSession(sessionId));
  if (!response.ok) {
    throw new Error(response.error?.message ?? t('defense.session.toast.unregisterError'));
  }
  toast.success(t('defense.session.toast.unregisterSuccess'));
  return response.data;
}, 'unregisterFromDefenseSessionAction').extend(withAsync({ status: true }));

export const defenseSessionDetailsQuery = query(
  async (sessionId: string) => {
    const response = await wrap(getDefenseSessionDetails(sessionId));
    if (!response.ok) {
      throw new Error(response.error?.message ?? 'Failed to fetch defense session details');
    }
    return response.data;
  },
  'defenseSessionDetailsQuery',
  {
    ttl: 5 * 60 * 1000, // Cache for 5 minutes
  }
);

export const isStudentRegisteredForSession = (session: DefenseSessionDetailsDTO | null, studentId: string): boolean => {
  if (!session || !session.participants) return false;
  return session.participants.some((participant) => participant.id === studentId);
};
