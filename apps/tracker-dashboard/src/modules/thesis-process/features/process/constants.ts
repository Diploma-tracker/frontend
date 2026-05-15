import { k } from '@/shared/utils/i18n';

import type { BadgeProps } from '@repo/ui-kit/components/common/data-display/badge';

import type { Stage } from '../../models/bachelor-thesis-process';

export const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  supervisor: 'Науковий керівник',
  plagiarism_supervisor: 'Перевіряючий антиплагіату',
  internship_supervisor: 'Керівник практики',
  commission_member: 'Член комісії',
  reviewer: 'Рецензент',
};

export const STAGE_LABELS: Record<string, string> = {
  init_process: 'Ініціалізація процесу',
  topic_approval: 'Узгодження теми',
  design: 'Етап проєктування',
  internship: 'Переддипломна практика',
  plagiarism_check: 'Перевірка на плагіат',
  defense_registration: 'Запис на захист',
  pre_defense: 'Передзахист',
  review: 'Рецензія проєкту',
  thesis_defense: 'Захист ДП',
};

export const STAGE_STATE_LABELS: Record<string, Record<string, string>> = {
  init_process: {
    start: 'Process Started',
    admin_init_process: 'Assigning Roles by Admin',
    end: 'Initialization Completed',
  },
  topic_approval: {
    start: 'Topic Approval Started',
    student_upload_topic: 'Awaiting Topic Upload by Student',
    supervisor_review_topic: 'Awaiting Topic Review by Supervisor',
    admin_review_topic: 'Awaiting Topic Approval by Admin',
    end: 'Topic Approved',
  },
  design: {
    start: 'Thesis Design Started',
    student_upload_thesis: 'Awaiting Thesis Materials Upload',
    supervisor_review_thesis: 'Awaiting Thesis Review by Supervisor',
    end: 'Thesis Design Approved',
  },
  internship: {
    start: 'Internship Stage Started',
    student_upload_internship_report: 'Awaiting Internship Report Upload',
    practice_supervisor_review: 'Awaiting Report Review by Practice Supervisor',
    end: 'Internship Report Approved',
  },
  plagiarism_check: {
    start: 'Plagiarism Check Started',
    plagiarism_supervisor_check: 'Awaiting Check by Plagiarism Supervisor',
    student_reupload_thesis: 'Awaiting Thesis Re-upload by Student',
    end: 'Plagiarism Check Passed',
  },
  defense_registration: {
    start: 'Defense Registration Started',
    student_register_defense: 'Awaiting Defense Date Selection',
    registered: 'Defense Registration Confirmed (Checkpoint)',
    end: 'Registration Phase Finalized',
  },
  pre_defense: {
    start: 'Pre-Defense Started',
    commission_review: 'Awaiting Review by Commission Member',
    student_reupload_thesis: 'Awaiting Revision Upload by Student',
    end: 'Pre-Defense Approved',
  },
  review: {
    start: 'Review Stage Started',
    reviewer_upload_report: 'Awaiting Review Report Upload',
    end: 'Review Report Submitted',
  },
  thesis_defense: {
    start: 'Thesis Defense Started',
    supervisor_add_grade: 'Awaiting Grade Entry by Supervisor',
    end: 'Thesis Defense Concluded',
  },
};

export const getStageStateLabel = (stage: Stage): string | null => {
  return (STAGE_STATE_LABELS[stage.id] ?? {})[stage.state ?? ''] ?? null;
};

type StageStatus = Stage['status'];

export const STATUS_LABELS: Record<
  StageStatus,
  { label: string; intent: BadgeProps['intent'] }
> = {
  active: { label: k('active'), intent: 'primary' },
  completed: { label: k('completed'), intent: 'success' },
  waiting: { label: k('wating'), intent: 'pending' },
};
