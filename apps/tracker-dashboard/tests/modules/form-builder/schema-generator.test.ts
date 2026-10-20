import type {
  FormDefinition,
  FormField,
  ProjectFieldDefinition,
  ValidationRule,
} from '@/modules/forms';
import { generateFormFromDomain } from '@/modules/forms';
import { describe, expect, it } from 'vitest';

const fieldDef = (name: string): ProjectFieldDefinition => ({
  name,
  kind: 'string',
  schema: { type: 'string' },
});

const formField = (
  name: string,
  label: string,
  required = false,
): FormField => ({ name, label, required });

const makeForm = (
  fields: FormField[],
  layout: string[][],
  rules: ValidationRule[] = [],
  name = 'form',
): FormDefinition => ({
  name,
  fields,
  validation_rules: rules,
  ui: layout,
});

describe('generateFormFromDomain', () => {
  it('maps required fields into schema.required', () => {
    const defs = [fieldDef('a'), fieldDef('b')];
    const form = makeForm(
      [formField('a', 'A', true), formField('b', 'B')],
      [['a'], ['b']],
    );
    const { schema } = generateFormFromDomain(defs, form);

    expect(schema.required).toEqual(['a']);
  });

  it('produces one anyOf branch per field for one_of_required', () => {
    const defs = [fieldDef('a'), fieldDef('b'), fieldDef('c')];
    const form = makeForm(
      [formField('a', 'A'), formField('b', 'B'), formField('c', 'C')],
      [['a', 'b', 'c']],
      [
        {
          id: 'r1',
          type: 'one_of_required',
          field_names: ['a', 'b', 'c'],
        },
      ],
    );
    const { schema } = generateFormFromDomain(defs, form);

    expect(schema.anyOf).toEqual([
      { required: ['a'] },
      { required: ['b'] },
      { required: ['c'] },
    ]);
  });

  it('takes schema fragments from field definitions, not hardcoded', () => {
    const defs = [fieldDef('age'), fieldDef('name')];
    const ageDef = defs[0];
    if (ageDef) ageDef.schema = { type: 'integer', minimum: 0 };
    const form = makeForm(
      [formField('age', 'Age'), formField('name', 'Name')],
      [['age', 'name']],
    );
    const { schema } = generateFormFromDomain(defs, form);

    expect(schema.properties?.['age']).toEqual({ type: 'integer', minimum: 0 });
    expect(schema.properties?.['name']).toEqual({ type: 'string' });
  });

  it('drops rule fields that are not present among fields', () => {
    const defs = [fieldDef('a'), fieldDef('b')];
    const form = makeForm(
      [formField('a', 'A'), formField('b', 'B')],
      [['a', 'b']],
      [
        {
          id: 'r1',
          type: 'one_of_required',
          field_names: ['a', 'b', 'missing'],
        },
      ],
    );
    const { schema } = generateFormFromDomain(defs, form);

    expect(schema.anyOf).toEqual([{ required: ['a'] }, { required: ['b'] }]);
  });

  it('requires at least two present fields for a rule branch', () => {
    const defs = [fieldDef('a'), fieldDef('b')];
    const form = makeForm(
      [formField('a', 'A'), formField('b', 'B')],
      [['a', 'b']],
      [
        {
          id: 'r1',
          type: 'one_of_required',
          field_names: ['a', 'b'],
        },
      ],
    );
    const { schema } = generateFormFromDomain(defs, form);

    expect(schema.anyOf).toHaveLength(2);
  });

  it('wraps same-row fields in HorizontalLayout', () => {
    const defs = [fieldDef('a'), fieldDef('b')];
    const form = makeForm(
      [formField('a', 'A'), formField('b', 'B')],
      [['a', 'b']],
    );
    const { uischema } = generateFormFromDomain(defs, form);

    expect(uischema.elements).toEqual([
      {
        type: 'HorizontalLayout',
        elements: [expect.any(Object), expect.any(Object)],
      },
    ]);
  });

  it('returns empty uischema for empty layout', () => {
    const defs: ProjectFieldDefinition[] = [];
    const form: FormDefinition = {
      name: 'empty',
      fields: [],
      validation_rules: [],
      ui: [],
    };
    const { uischema } = generateFormFromDomain(defs, form);

    expect(uischema.elements).toEqual([]);
  });

  it('marks file kind controls with options.file, others without', () => {
    const defs: ProjectFieldDefinition[] = [
      { name: 'doc', kind: 'file', schema: { type: 'string' } },
      { name: 'age', kind: 'integer', schema: { type: 'integer' } },
    ];
    const form = makeForm(
      [formField('doc', 'Doc'), formField('age', 'Age')],
      [['doc', 'age']],
    );
    const { uischema } = generateFormFromDomain(defs, form);

    const row = uischema.elements?.[0];
    const controls = row && 'elements' in row ? row.elements : [];
    expect(controls[0]).toMatchObject({
      scope: '#/properties/doc',
      options: { file: true },
    });
    expect(controls[1]).toMatchObject({
      scope: '#/properties/age',
      options: {},
    });
  });
});
