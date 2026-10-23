import type {
  FieldKind,
  FormDefinition,
  FormField,
  ValidationRule,
} from '@/modules/forms';
import { generateFormFromDomain } from '@/modules/forms';
import { describe, expect, it } from 'vitest';

const formField = (
  name: string,
  label: string,
  required = false,
  kind: FieldKind = 'string',
  schema: FormField['schema'] = {
    type: kind === 'file' ? 'string' : kind,
  },
): FormField => ({ name, label, required, kind, schema });

const makeForm = (
  fields: FormField[],
  layout: string[][],
  rules: ValidationRule[] = [],
  name = 'form',
): FormDefinition => ({
  id: crypto.randomUUID(),
  name,
  fields,
  validation_rules: rules,
  ui: layout,
});

describe('generateFormFromDomain', () => {
  it('maps required fields into schema.required', () => {
    const form = makeForm(
      [formField('a', 'A', true), formField('b', 'B')],
      [['a'], ['b']],
    );
    const { schema } = generateFormFromDomain(form);

    expect(schema.required).toEqual(['a']);
  });

  it('produces one anyOf branch per field for one_of_required', () => {
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
    const { schema } = generateFormFromDomain(form);

    expect(schema.anyOf).toEqual([
      { required: ['a'] },
      { required: ['b'] },
      { required: ['c'] },
    ]);
  });

  it('takes schema fragments from each form field', () => {
    const form = makeForm(
      [
        formField('age', 'Age', false, 'integer', {
          type: 'integer',
          minimum: 0,
        }),
        formField('name', 'Name'),
      ],
      [['age', 'name']],
    );
    const { schema } = generateFormFromDomain(form);

    expect(schema.properties?.['age']).toEqual({ type: 'integer', minimum: 0 });
    expect(schema.properties?.['name']).toEqual({ type: 'string' });
  });

  it('drops rule fields that are not present among fields', () => {
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
    const { schema } = generateFormFromDomain(form);

    expect(schema.anyOf).toEqual([{ required: ['a'] }, { required: ['b'] }]);
  });

  it('requires at least two present fields for a rule branch', () => {
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
    const { schema } = generateFormFromDomain(form);

    expect(schema.anyOf).toHaveLength(2);
  });

  it('wraps same-row fields in HorizontalLayout', () => {
    const form = makeForm(
      [formField('a', 'A'), formField('b', 'B')],
      [['a', 'b']],
    );
    const { uischema } = generateFormFromDomain(form);

    expect(uischema.elements).toEqual([
      {
        type: 'HorizontalLayout',
        elements: [expect.any(Object), expect.any(Object)],
      },
    ]);
  });

  it('returns empty uischema for empty layout', () => {
    const form: FormDefinition = {
      id: crypto.randomUUID(),
      name: 'empty',
      fields: [],
      validation_rules: [],
      ui: [],
    };
    const { uischema } = generateFormFromDomain(form);

    expect(uischema.elements).toEqual([]);
  });

  it('marks file kind controls with options.file, others without', () => {
    const form = makeForm(
      [
        formField('doc', 'Doc', false, 'file', { type: 'string' }),
        formField('age', 'Age', false, 'integer', { type: 'integer' }),
      ],
      [['doc', 'age']],
    );
    const { uischema } = generateFormFromDomain(form);

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
