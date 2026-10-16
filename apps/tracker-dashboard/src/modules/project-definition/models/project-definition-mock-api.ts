// TODO: Replace with real `@repo/api` calls once the backend exposes project
// definition endpoints (see DIP-14). Everything here is a temporary stand-in
// so the editor can be developed without backend communication.
import type { ProjectDefinitionEntry, ProjectDefinitionOutput } from './types';

const MOCK_LATENCY_MS = 400;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export interface MockProjectRole {
  name: string;
  slots: number;
  core: boolean;
}

export interface ProjectDefinitionSnapshot {
  name: string;
  fields: ProjectDefinitionEntry[];
  roles: MockProjectRole[];
}

const mockProjectDefinition: ProjectDefinitionSnapshot = {
  name: 'Bachelor thesis 2026',
  fields: [
    { type: 'grade', name: 'Grade' },
    { type: 'bool', name: 'Is top rated' },
    { type: 'string', name: 'topic en', validation: { min: 5, max: 50 } },
    { type: 'string', name: 'topic uk', validation: { min: 5, max: 50 } },
  ],
  roles: [
    { name: 'Teacher', slots: 1, core: true },
    { name: 'Student', slots: 2, core: true },
    { name: 'Reviewer', slots: 1, core: false },
  ],
};

export const fetchProjectDefinition =
  async (): Promise<ProjectDefinitionSnapshot> => {
    await wait(MOCK_LATENCY_MS);

    return {
      name: mockProjectDefinition.name,
      fields: mockProjectDefinition.fields.map((entry) => ({
        ...entry,
        validation: entry.validation ? { ...entry.validation } : undefined,
      })),
      roles: mockProjectDefinition.roles.map((role) => ({ ...role })),
    };
  };

export const saveProjectDefinition = async (
  definition: ProjectDefinitionOutput,
): Promise<ProjectDefinitionOutput> => {
  await wait(MOCK_LATENCY_MS);

  return definition;
};
