import { type User, userAtom } from '@/modules/user';
import { action, atom, computed, withAsyncData, wrap } from '@reatom/core';

import { bachelorThesisProcess } from '@repo/api';
import type { ThesisDataDTO } from '@repo/api';
import { LoginTokenUserRole } from '@repo/api/model';

const StageStatus = {
  active: 'active',
  completed: 'completed',
  waiting: 'waiting',
} as const;

type StageStatus = keyof typeof StageStatus;

export interface Stage {
  id: string;
  status: StageStatus; // top level status of the stage
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
      actors: data.actors.map((a) => ({
        userId: a.id,
        role: a.role as ThesisRole,
      })),
      stages: data.stages.map((s) => ({
        id: s.id,
        status: s.status as StageStatus,
        state: s.state ?? null,
        deadline: s.deadline ?? null,
      })),
      data: data.data,
    };

    for (const stage of process.stages) {
      if (stage.status === 'active') {
        selectedStage.set(stage.id);
        break;
      }
    }

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
