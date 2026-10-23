import type { JsonSchema, Layout, UISchemaElement } from '@jsonforms/core';

import type {
  BuilderOutput,
  FormDefinition,
  FormField,
  RowLayout,
  ValidationRule,
} from './types';

/**
 * Buduje JSON Schema з ProjectFieldDefinition (довідник схем) + FormField
 * (поля форми) + правила крос-польової валідації.
 *
 * Крос-польове правило `{ field_names: [a, b, c] }` генерує
 * `anyOf: [{ required: [a] }, { required: [b] }, { required: [c] }]` —
 * «хоча б одне з полів заповнене», що відповідає `OneOfRequired.is_broken` на бекенді.
 */
export const generateJsonSchema = (
  formFields: FormField[],
  rules: ValidationRule[],
): JsonSchema => {
  const schemaByName = new Map(formFields.map((fd) => [fd.name, fd.schema]));
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const field of formFields) {
    const schema = schemaByName.get(field.name);
    if (schema) {
      properties[field.name] = schema;
    }
    if (field.required) {
      required.push(field.name);
    }
  }

  const existingNames = new Set(formFields.map((f) => f.name));
  const anyOf = rules
    .filter((rule) => rule.type === 'one_of_required')
    .flatMap((rule) => {
      const names = rule.field_names.filter((name) => existingNames.has(name));
      if (names.length < 2) return [];
      return names.map((name) => ({ required: [name] }));
    });

  const schema: JsonSchema = { type: 'object', properties } as JsonSchema;
  if (required.length > 0) schema.required = required;
  if (anyOf.length > 0) schema.anyOf = anyOf;
  return schema;
};

/**
 * Buduje uiSchema для JsonForms з розкладки: кожен рядок → HorizontalLayout
 * з Controls для полів у цьому рядку. Увесь форму — VerticalLayout над рядками.
 *
 * Rendering hints (e.g. the file control) come from the backend-provided
 * `kind`, never from guessing keywords in the JSON Schema.
 */
export const generateUiSchema = (
  layout: RowLayout,
  formFields: FormField[],
): Layout => {
  const fieldsByName = new Map(formFields.map((f) => [f.name, f]));
  const kindByName = new Map(formFields.map((fd) => [fd.name, fd.kind]));

  const elements: UISchemaElement[] = layout.flatMap((row) => {
    const controls = row
      .map((name) => fieldsByName.get(name))
      .filter((field): field is FormField => Boolean(field))
      .map((field): UISchemaElement => {
        const kind = kindByName.get(field.name);
        return {
          type: 'Control',
          scope: `#/properties/${field.name}`,
          label: field.label,
          options: {
            ...(field.placeholder ? { placeholder: field.placeholder } : {}),
            ...(kind === 'file' ? { file: true } : {}),
          },
        };
      });

    if (controls.length === 0) {
      return [];
    }
    return [{ type: 'HorizontalLayout', elements: controls }];
  });

  return { type: 'VerticalLayout', elements };
};

/**
 * Повний вихід білдера: JSON Schema + uiSchema. Schema-фрагменти беруться з
 * ProjectFieldDefinition.schema (надходить з бекенду), uiSchema — з layout.
 */
export const generateFormFromDomain = (form: FormDefinition): BuilderOutput => {
  const schema = generateJsonSchema(form.fields, form.validation_rules);
  const uischema = generateUiSchema(form.ui, form.fields);
  return { schema, uischema };
};
