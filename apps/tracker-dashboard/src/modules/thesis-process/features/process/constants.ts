import { k } from '@/shared/utils/i18n';

import type { BadgeProps } from '@repo/ui-kit/components/common/data-display/badge';

import type { Stage } from '../../models/bachelor-thesis-process';

export const ROLE_LABELS: Record<string, string> = {
  student: k('thesisProcess.roles.student'),
  supervisor: k('thesisProcess.roles.supervisor'),
  plagiarism_supervisor: k('thesisProcess.roles.plagiarism_supervisor'),
  internship_supervisor: k('thesisProcess.roles.internship_supervisor'),
  commission_member: k('thesisProcess.roles.commission_member'),
  reviewer: k('thesisProcess.roles.reviewer'),
};

export const STAGE_LABELS: Record<string, string> = {
  init_process: k('thesisProcess.stages.init_process'),
  topic_approval: k('thesisProcess.stages.topic_approval'),
  design: k('thesisProcess.stages.design'),
  internship: k('thesisProcess.stages.internship'),
  plagiarism_check: k('thesisProcess.stages.plagiarism_check'),
  defense_registration: k('thesisProcess.stages.defense_registration'),
  pre_defense: k('thesisProcess.stages.pre_defense'),
  review: k('thesisProcess.stages.review'),
  thesis_defense: k('thesisProcess.stages.thesis_defense'),
};

export const STAGE_STATE_LABELS: Record<string, Record<string, string>> = {
  init_process: {
    start: k('thesisProcess.stageStates.init_process.start'),
    admin_init_process: k(
      'thesisProcess.stageStates.init_process.admin_init_process',
    ),
    end: k('thesisProcess.stageStates.init_process.end'),
  },
  topic_approval: {
    start: k('thesisProcess.stageStates.topic_approval.start'),
    student_upload_topic: k(
      'thesisProcess.stageStates.topic_approval.student_upload_topic',
    ),
    supervisor_review_topic: k(
      'thesisProcess.stageStates.topic_approval.supervisor_review_topic',
    ),
    admin_review_topic: k(
      'thesisProcess.stageStates.topic_approval.admin_review_topic',
    ),
    end: k('thesisProcess.stageStates.topic_approval.end'),
  },
  design: {
    start: k('thesisProcess.stageStates.design.start'),
    student_upload_thesis: k(
      'thesisProcess.stageStates.design.student_upload_thesis',
    ),
    supervisor_review_thesis: k(
      'thesisProcess.stageStates.design.supervisor_review_thesis',
    ),
    end: k('thesisProcess.stageStates.design.end'),
  },
  internship: {
    start: k('thesisProcess.stageStates.internship.start'),
    student_upload_internship_report: k(
      'thesisProcess.stageStates.internship.student_upload_internship_report',
    ),
    practice_supervisor_review: k(
      'thesisProcess.stageStates.internship.practice_supervisor_review',
    ),
    end: k('thesisProcess.stageStates.internship.end'),
  },
  plagiarism_check: {
    start: k('thesisProcess.stageStates.plagiarism_check.start'),
    plagiarism_supervisor_check: k(
      'thesisProcess.stageStates.plagiarism_check.plagiarism_supervisor_check',
    ),
    student_reupload_thesis: k(
      'thesisProcess.stageStates.plagiarism_check.student_reupload_thesis',
    ),
    end: k('thesisProcess.stageStates.plagiarism_check.end'),
  },
  defense_registration: {
    start: k('thesisProcess.stageStates.defense_registration.start'),
    student_register_defense: k(
      'thesisProcess.stageStates.defense_registration.student_register_defense',
    ),
    registered: k('thesisProcess.stageStates.defense_registration.registered'),
    end: k('thesisProcess.stageStates.defense_registration.end'),
  },
  pre_defense: {
    start: k('thesisProcess.stageStates.pre_defense.start'),
    commission_review: k(
      'thesisProcess.stageStates.pre_defense.commission_review',
    ),
    student_reupload_thesis: k(
      'thesisProcess.stageStates.pre_defense.student_reupload_thesis',
    ),
    end: k('thesisProcess.stageStates.pre_defense.end'),
  },
  review: {
    start: k('thesisProcess.stageStates.review.start'),
    reviewer_upload_report: k(
      'thesisProcess.stageStates.review.reviewer_upload_report',
    ),
    end: k('thesisProcess.stageStates.review.end'),
  },
  thesis_defense: {
    start: k('thesisProcess.stageStates.thesis_defense.start'),
    supervisor_add_grade: k(
      'thesisProcess.stageStates.thesis_defense.supervisor_add_grade',
    ),
    end: k('thesisProcess.stageStates.thesis_defense.end'),
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
  active: { label: k('thesisProcess.status.active'), intent: 'primary' },
  completed: { label: k('thesisProcess.status.completed'), intent: 'success' },
  waiting: { label: k('thesisProcess.status.waiting'), intent: 'pending' },
};
