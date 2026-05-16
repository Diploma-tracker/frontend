import { type User, userAtom } from '@/modules/user';
import { calculatePercentage } from '@/shared/utils/percentage';
import { action, atom, computed, withAsyncData, wrap } from '@reatom/core';

import { bachelorThesisProcess } from '@repo/api';
import type { ThesisDataDTO } from '@repo/api';
import { LoginTokenUserRole } from '@repo/api/model';

const Status = {
  active: 'active',
  completed: 'completed',
  waiting: 'waiting',
} as const;

type Status = keyof typeof Status;

export interface Stage {
  id: string;
  status: Status; // top level status of the stage
  state: string | null; // e.g. full status like "pending review", "approved", "rejected" etc.
  deadline: string | null;
}

export const ThesisRole = {
  student: 'student',
  supervisor: 'supervisor',
  plagiarism_supervisor: 'plagiarism_supervisor',
  internship_supervisor: 'internship_supervisor',
  commission_member: 'commission_member',
  reviewer: 'reviewer',
  admin: 'admin',
} as const;

export type ThesisRole = keyof typeof ThesisRole;

export interface Actor {
  userId: string;
  role: ThesisRole;
}

export interface ProjectProcess {
  id: string;
  allocationRoundId: string;
  actors: Actor[];
  stages: Stage[];
  data: ThesisDataDTO;
}

function userRoleInThesisProcess(
  user: User,
  thesis: ProjectProcess,
): ThesisRole | null {
  if (user.role === LoginTokenUserRole.admin) return ThesisRole.admin;
  return thesis.actors.find((a) => a.userId === user.id)?.role ?? null;
}

const NULL_PROCESS: ProjectProcess = {
  id: '',
  allocationRoundId: '',
  actors: [],
  stages: [],
  data: {
    topic: null,
    thesisArchive: null,
    thesisReport: null,
    internshipReport: null,
    plagiarismReport: null,
    reviewReport: null,
    grade: null,
    gradeLetter: null,
  },
};

export const selectedStage = atom('', 'selectedStage');
// Stores the process ID once loaded (used when sending events)
export const bachalorThesisProcessId = atom('', 'currentProcess');

// Incrementing this atom triggers fetchBachalorThesisProcess to re-run.
export const processRefreshTrigger = atom(0, 'processRefreshTrigger');

export const fetchBachalorThesisProcess = computed(
  async (): Promise<ProjectProcess> => {
    processRefreshTrigger(); // subscribe so bumping it causes a re-fetch

    const id = bachalorThesisProcessId();
    if (!id) return NULL_PROCESS;

    const response = await wrap(
      bachelorThesisProcess.getBachelorThesisProcessDetails(id),
    );
    if (!response.ok) {
      throw new Error(
        response.error?.message ?? 'Failed to fetch thesis process',
      );
    }

    const data = response.data;
    const process: ProjectProcess = {
      id: data.id,
      allocationRoundId: data.allocationRoundId ?? '',
      actors: data.actors.map((a) => ({
        userId: a.id,
        role: a.role as ThesisRole,
      })),
      stages: data.stages.map((s) => ({
        id: s.id,
        status: s.status as Status,
        state: s.state ?? null,
        deadline: s.deadline ?? null,
      })),
      data: data.data,
    };

    let selectedStageId = process.stages[0]?.id ?? null;
    let isAllCompleted = true;
    for (const stage of process.stages) {
      if (stage.status !== 'completed') {
        isAllCompleted = false;
      }
      if (stage.status === 'active') {
        selectedStageId = stage.id;
        break;
      }
    }
    if (isAllCompleted) {
      selectedStageId = process.stages[process.stages.length - 1]?.id ?? null;
    }
    selectedStage.set(selectedStageId ?? '');

    return process;
  },
  'getBachalorThesis',
).extend(withAsyncData({ status: true }));

export const selectedStageDetail = computed(() => {
  const process = fetchBachalorThesisProcess.data();
  const stageId = selectedStage();
  return process?.stages.find((stage) => stage.id === stageId) ?? null;
}, 'selectedStageDetail');

export const thesisData = computed(() => {
  return fetchBachalorThesisProcess.data() ?? null;
}, 'thesisData');

export const activeStages = computed(() => {
  const process = fetchBachalorThesisProcess.data();
  return process?.stages.filter((stage) => stage.status === 'active') ?? [];
}, 'activeStages');

export const processProgress = computed(() => {
  const process = fetchBachalorThesisProcess.data();
  if (!process) {
    return {
      status: 'waiting' as Status,
      total: 0,
      completed: 0,
      percentage: 0,
    };
  }

  const total = process.stages.length;
  const completed = process.stages.filter(
    (s) => s.status === 'completed',
  ).length;

  const isCompleted = total > 0 && completed === total;

  return {
    status: (isCompleted ? 'completed' : 'active') as Status,
    total,
    completed,
    percentage: calculatePercentage(completed, total, 0),
  };
}, 'progress');

export const userRole = computed(() => {
  const process = fetchBachalorThesisProcess.data();
  const user = userAtom();
  if (!process || !user) return null;
  return userRoleInThesisProcess(user, process);
}, 'userRole');

export const sendProcessEvent = action(
  async ({
    processId,
    event,
  }: {
    processId: string;
    event: Record<string, unknown>;
  }) => {
    await bachelorThesisProcess.sendBachelorThesisProcessEvent({
      processId,
      event,
    } as unknown as Parameters<
      typeof bachelorThesisProcess.sendBachelorThesisProcessEvent
    >[0]);
    processRefreshTrigger.set((n) => n + 1);
  },
  'sendProcessEvent',
);
