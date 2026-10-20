import {
  availableFieldsAtom,
  catalogAtom,
  commit,
  fieldsAtom,
  placeField,
  removeField,
} from '@/modules/forms';
import { resetFormBuilderTestState } from '@tests/utils/reset-form-builder-test-state';
import { beforeEach, describe, expect, it } from 'vitest';

const catalogNames = () => catalogAtom().map((field) => field.name);

describe('availableFieldsAtom', () => {
  beforeEach(() => {
    resetFormBuilderTestState();
  });

  it('returns the whole catalog when no field is placed', () => {
    expect(availableFieldsAtom().map((field) => field.name)).toEqual(
      catalogNames(),
    );
  });

  it('hides a type once its field is placed', () => {
    placeField({ name: 'string', label: 'string', required: false });
    commit();

    expect(availableFieldsAtom().map((field) => field.name)).not.toContain(
      'string',
    );
    expect(availableFieldsAtom()).toHaveLength(catalogNames().length - 1);
  });

  it('keeps types that are not placed', () => {
    placeField({ name: 'integer', label: 'integer', required: false });
    commit();

    const names = availableFieldsAtom().map((field) => field.name);
    expect(names).toContain('string');
    expect(names).toContain('bool');
    expect(names).not.toContain('integer');
  });

  it('restores a type to the palette after its field is removed', () => {
    placeField({ name: 'bool', label: 'bool', required: false });
    commit();
    expect(availableFieldsAtom().map((field) => field.name)).not.toContain(
      'bool',
    );

    removeField('bool');

    expect(availableFieldsAtom().map((field) => field.name)).toContain('bool');
  });

  it('does not mutate the catalog when filtering', () => {
    const before = catalogNames();
    placeField({ name: 'grade', label: 'grade', required: false });
    commit();

    availableFieldsAtom();

    expect(catalogNames()).toEqual(before);
  });

  it('reflects every placed field, not just the first', () => {
    placeField({ name: 'string', label: 'string', required: false });
    placeField({ name: 'integer', label: 'integer', required: false });
    commit();

    const names = availableFieldsAtom().map((field) => field.name);
    expect(names).not.toContain('string');
    expect(names).not.toContain('integer');
    expect(fieldsAtom()).toHaveLength(2);
  });
});
