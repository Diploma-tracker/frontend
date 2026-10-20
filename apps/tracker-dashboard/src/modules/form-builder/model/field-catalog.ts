import { atom } from '@reatom/core';

import type { ProjectFieldDefinition } from './types';

// TODO: Replace with `GET /fields-types` from the backend once the real catalog
// is available. The renderer/canvas code must only depend on the
// `ProjectFieldDefinition` contract so that swapping the loader is the only
// change needed.
const mockCatalog: ProjectFieldDefinition[] = [
  {
    name: 'string',
    kind: 'string',
    schema: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      pattern: '^(?:[\\w\\s-]+)$',
    },
  },
  {
    name: 'integer',
    kind: 'integer',
    schema: { type: 'integer', minimum: 0, maximum: 9999 },
  },
  { name: 'bool', kind: 'boolean', schema: { type: 'boolean' } },
  {
    name: 'document',
    kind: 'file',
    schema: {
      type: 'string',
      pattern: '\\S',
      'x-file-types': ['pdf', 'docx'],
    },
  },
  {
    name: 'image',
    kind: 'file',
    schema: {
      type: 'string',
      pattern: '\\S',
      'x-file-types': ['image/png', 'image/jpeg'],
    },
  },
  {
    name: 'any_file',
    kind: 'file',
    schema: {
      type: 'string',
      pattern: '\\S',
    },
  },
  {
    name: 'grade',
    kind: 'integer',
    schema: { type: 'integer', minimum: 0, maximum: 100 },
  },
];

export const catalogAtom = atom(mockCatalog, 'formBuilder.catalog');
