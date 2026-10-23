import { atom } from '@reatom/core';

import type { FormDefinition } from './types';

const initialAvailableForms: FormDefinition[] = [
  {
    id: 'student-registration',
    name: 'Student registration',
    fields: [
      {
        name: 'full_name',
        kind: 'string',
        schema: { type: 'string', minLength: 1 },
        label: 'Full name',
        required: true,
      },
      {
        name: 'email',
        kind: 'string',
        schema: { type: 'string', format: 'email' },
        label: 'Email',
        required: true,
      },
    ],
    validation_rules: [],
    ui: [['full_name'], ['email']],
  },
  {
    id: 'project-proposal',
    name: 'Project proposal',
    fields: [
      {
        name: 'title',
        kind: 'string',
        schema: { type: 'string', minLength: 1 },
        label: 'Project title',
        required: true,
      },
      {
        name: 'summary',
        kind: 'string',
        schema: { type: 'string' },
        label: 'Summary',
        required: false,
      },
    ],
    validation_rules: [],
    ui: [['title'], ['summary']],
  },
];

/** Available, saved forms shared by the design and BPMN modules. */
export const availableFormsAtom = atom<FormDefinition[]>(
  initialAvailableForms,
  'forms.available',
);
