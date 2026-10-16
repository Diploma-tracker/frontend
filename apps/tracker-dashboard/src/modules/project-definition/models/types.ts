export type ProjectFieldType = 'string' | 'number' | 'bool' | 'grade' | 'date';

export interface ProjectFieldValidation {
  min?: number;
  max?: number;
}

/**
 * Entry of the project definition as it is sent to the backend: validation
 * lives on the project data field level so it is defined once and reused by
 * every form that references the field.
 */
export interface ProjectDefinitionEntry {
  type: string;
  name: string;
  validation?: ProjectFieldValidation;
}

export interface ProjectField {
  id: string;
  type: ProjectFieldType;
  name: string;
  validation: ProjectFieldValidation;
}

/**
 * Role definition as it is sent to the backend: a name plus the number of
 * slots available for this role in the project.
 */
export interface ProjectRoleDefinitionEntry {
  name: string;
  slots: number;
}

export interface ProjectRole {
  id: string;
  name: string;
  /** Slots available for the role in the project. Always >= 1. */
  slots: number;
  /** Core roles always exist and can't be removed; only slots are editable. */
  isCore: boolean;
}

export interface ProjectDefinitionOutput {
  name: string;
  fields: ProjectDefinitionEntry[];
  roles: ProjectRoleDefinitionEntry[];
}

export const PROJECT_FIELD_TYPES: ProjectFieldType[] = [
  'string',
  'number',
  'bool',
  'grade',
  'date',
];

export const isProjectFieldType = (value: string): value is ProjectFieldType =>
  PROJECT_FIELD_TYPES.includes(value as ProjectFieldType);
