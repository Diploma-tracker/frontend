import { t } from '@/shared/utils/i18n';
import { action, atom, computed, withAsyncData } from '@reatom/core';

import { toast } from '@repo/ui-kit/components/common/floating/sonner';

import { AVAILABLE_FIELD_TYPES_BY_TYPE } from './field-catalog';
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

export const selectedFieldAtom = computed(
  () =>
    projectFieldsAtom().find((field) => field.id === selectedFieldIdAtom()) ??
    null,
  'projectDefinition.selectedField',
);

export const definitionOutputAtom = computed(
  (): ProjectDefinitionOutput => ({
    fields: projectFieldsAtom().map<ProjectDefinitionEntry>((field) => {
      const { min, max } = field.validation;
      const supportsValidation =
        AVAILABLE_FIELD_TYPES_BY_TYPE[field.type].supportsValidation;
      const hasValidation = min !== undefined || max !== undefined;

      const entry: ProjectDefinitionEntry = {
        type: field.type,
        name: field.name.trim(),
      };

      if (supportsValidation && hasValidation) {
        entry.validation = {
          ...(min !== undefined ? { min } : {}),
          ...(max !== undefined ? { max } : {}),
        };
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
  validation: { ...entry.validation },
});

export const loadProjectDefinitionAction = action(async () => {
  const snapshot = await fetchProjectDefinition();
  const fields = snapshot.fields
    .filter((entry) => isProjectFieldType(entry.type))
    .map(entryToField);

  projectFieldsAtom.set(fields);
  selectedFieldIdAtom.set(fields[0]?.id ?? null);
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

export const addProjectFieldAction = action((type: ProjectFieldType) => {
  const field: ProjectField = {
    id: crypto.randomUUID(),
    type,
    name: '',
    validation: {},
  };

  projectFieldsAtom.set((fields) => [...fields, field]);
  selectedFieldIdAtom.set(field.id);
}, 'addProjectField');

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

export const moveProjectFieldAction = action(
  (id: string, direction: 'up' | 'down') => {
    projectFieldsAtom.set((fields) => {
      const index = fields.findIndex((field) => field.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (index === -1 || targetIndex < 0 || targetIndex >= fields.length) {
        return fields;
      }

      const nextFields = [...fields];
      const moved = nextFields[index];

      if (!moved) {
        return fields;
      }

      nextFields[index] = nextFields[targetIndex] as ProjectField;
      nextFields[targetIndex] = moved;

      return nextFields;
    });
  },
  'moveProjectField',
);

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
