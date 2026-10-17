import { t } from '@/shared/utils/i18n';
import { action, atom, computed, withAsyncData } from '@reatom/core';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import {
  fetchProjectDefinition,
  saveProjectDefinition,
} from './project-definition-mock-api';
import {
  type ProjectDefinitionEntry,
  type ProjectDefinitionOutput,
  type ProjectField,
  type ProjectFieldType,
  type ProjectRole,
  type ProjectRoleDefinitionEntry,
  isProjectFieldType,
} from './types';

export const projectDefinitionNameAtom = atom<string>(
  '',
  'projectDefinition.name',
);

export const projectFieldsAtom = atom<ProjectField[]>(
  [],
  'projectDefinition.fields',
);

export const projectRolesAtom = atom<ProjectRole[]>(
  [],
  'projectDefinition.roles',
);

export const selectedFieldIdAtom = atom<string | null>(
  null,
  'projectDefinition.selectedFieldId',
);

/**
 * Droppable id of the project fields list. Registered as a droppable only
 * while the list is empty, so a palette drag has somewhere to land before any
 * field exists.
 */
export const PROJECT_FIELDS_DROPPABLE_ID = 'project-fields-canvas';

/** dnd-kit draggable id of a palette tile standing for a field type. */
export const projectFieldDragId = (type: ProjectFieldType) =>
  `project-field-type-${type}`;

export type ProjectFieldDragSession =
  | { source: 'palette'; type: ProjectFieldType }
  | { source: 'fields'; id: string };

export const projectFieldDragSessionAtom = atom<ProjectFieldDragSession | null>(
  null,
  'projectDefinition.fieldDragSession',
);

/**
 * Set only for a palette drop: the field the ghost lands on once the drag
 * ends. Kept around for the drop animation, which glides the ghost onto that
 * field's droppable rect. A reorder leaves it null and keeps dnd-kit's own
 * drop animation.
 */
export const projectFieldDropSessionAtom = atom<{ id: string } | null>(
  null,
  'projectDefinition.fieldDropSession',
);

export const selectedFieldAtom = computed(
  () =>
    projectFieldsAtom().find((field) => field.id === selectedFieldIdAtom()) ??
    null,
  'projectDefinition.selectedField',
);

export const definitionOutputAtom = computed(
  (): ProjectDefinitionOutput => ({
    name: projectDefinitionNameAtom().trim(),
    fields: projectFieldsAtom().map<ProjectDefinitionEntry>((field) => {
      const entry: ProjectDefinitionEntry = {
        type: field.type,
        name: field.name.trim(),
      };

      if (Object.keys(field.settings).length > 0) {
        entry.settings = { ...field.settings };
      }

      return entry;
    }),
    roles: projectRolesAtom().map<ProjectRoleDefinitionEntry>((role) => ({
      name: role.name.trim(),
      slots: role.slots,
    })),
  }),
  'projectDefinition.output',
);

export const hasDuplicateRoleNamesAtom = computed(() => {
  const names = projectRolesAtom()
    .map((role) => role.name.trim().toLowerCase())
    .filter((name) => name.length > 0);

  return new Set(names).size !== names.length;
}, 'projectDefinition.hasDuplicateRoleNames');

const entryToField = (entry: ProjectDefinitionEntry): ProjectField => ({
  id: crypto.randomUUID(),
  type: entry.type as ProjectFieldType,
  name: entry.name,
  settings: { ...entry.settings },
});

export const loadProjectDefinitionAction = action(async () => {
  const snapshot = await fetchProjectDefinition();
  const fields = snapshot.fields
    .filter((entry) => isProjectFieldType(entry.type))
    .map(entryToField);

  projectFieldsAtom.set(fields);
  selectedFieldIdAtom.set(fields[0]?.id ?? null);
  projectDefinitionNameAtom.set(snapshot.name);
  projectRolesAtom.set(
    snapshot.roles.map((role) => ({
      id: crypto.randomUUID(),
      name: role.name,
      slots: Math.max(1, Math.round(role.slots)),
      isCore: role.core,
    })),
  );

  return snapshot;
}, 'loadProjectDefinition').extend(withAsyncData({ status: true }));

export const saveProjectDefinitionAction = action(async () => {
  const definition = definitionOutputAtom();

  // TODO: Replace with a real backend request; print the payload for now.
  // eslint-disable-next-line no-console
  console.log('[project-definition] save payload', definition);

  try {
    await saveProjectDefinition(definition);
  } catch (error) {
    toast.error(t('projectDefinition.toast.saveError'));
    throw error;
  }

  toast.success(t('projectDefinition.toast.saveSuccess'));

  return definition;
}, 'saveProjectDefinition').extend(withAsyncData({ status: true }));

export const addProjectFieldAction = action(
  (type: ProjectFieldType, index?: number) => {
    const field: ProjectField = {
      id: crypto.randomUUID(),
      type,
      name: '',
      settings: {},
    };

    projectFieldsAtom.set((fields) => {
      const insertAt =
        index === undefined ? -1 : Math.min(Math.max(index, 0), fields.length);

      if (insertAt === -1) {
        return [...fields, field];
      }

      const nextFields = [...fields];
      nextFields.splice(insertAt, 0, field);

      return nextFields;
    });
    selectedFieldIdAtom.set(field.id);

    return field;
  },
  'addProjectField',
);

export const selectProjectFieldAction = action((id: string) => {
  selectedFieldIdAtom.set(id);
}, 'selectProjectField');

export const updateProjectFieldAction = action(
  (id: string, patch: Partial<Omit<ProjectField, 'id'>>) => {
    projectFieldsAtom.set((fields) =>
      fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  },
  'updateProjectField',
);

export const removeProjectFieldAction = action((id: string) => {
  const fields = projectFieldsAtom();
  const index = fields.findIndex((field) => field.id === id);

  if (index === -1) {
    return;
  }

  const nextFields = fields.filter((field) => field.id !== id);
  projectFieldsAtom.set(nextFields);

  if (selectedFieldIdAtom() === id) {
    const neighbor = nextFields[Math.min(index, nextFields.length - 1)];
    selectedFieldIdAtom.set(neighbor?.id ?? null);
  }
}, 'removeProjectField');

export const reorderProjectFieldsAction = action(
  (activeId: string, overId: string) => {
    projectFieldsAtom.set((fields) => {
      const from = fields.findIndex((field) => field.id === activeId);
      const to = fields.findIndex((field) => field.id === overId);

      if (from === -1 || to === -1 || from === to) {
        return fields;
      }

      const nextFields = [...fields];
      const [moved] = nextFields.splice(from, 1);

      if (!moved) {
        return fields;
      }

      nextFields.splice(to, 0, moved);

      return nextFields;
    });
  },
  'reorderProjectFields',
);

export const beginProjectFieldDragAction = action(
  (session: ProjectFieldDragSession) => {
    projectFieldDropSessionAtom.set(null);
    projectFieldDragSessionAtom.set(session);
  },
  'beginProjectFieldDrag',
);

export const endProjectFieldDragAction = action((dropId: string | null) => {
  projectFieldDragSessionAtom.set(null);
  projectFieldDropSessionAtom.set(dropId ? { id: dropId } : null);
}, 'endProjectFieldDrag');

export const addProjectRoleAction = action(() => {
  const role: ProjectRole = {
    id: crypto.randomUUID(),
    name: '',
    slots: 1,
    isCore: false,
  };

  projectRolesAtom.set((roles) => [...roles, role]);
}, 'addProjectRole');

export const updateProjectRoleAction = action(
  (id: string, patch: Partial<Pick<ProjectRole, 'name' | 'slots'>>) => {
    projectRolesAtom.set((roles) =>
      roles.map((role) => {
        if (role.id !== id) {
          return role;
        }

        const next: ProjectRole = {
          ...role,
          // Core roles are permanent: only their slot count can change.
          name: role.isCore ? role.name : (patch.name ?? role.name),
        };

        if (patch.slots !== undefined) {
          next.slots = Number.isFinite(patch.slots)
            ? Math.max(1, Math.round(patch.slots))
            : 1;
        }

        return next;
      }),
    );
  },
  'updateProjectRole',
);

export const removeProjectRoleAction = action((id: string) => {
  const role = projectRolesAtom().find((item) => item.id === id);

  if (!role || role.isCore) {
    return;
  }

  projectRolesAtom.set((roles) => roles.filter((item) => item.id !== id));
}, 'removeProjectRole');
