import type {
  ControlElement,
  JsonSchema,
  Layout,
  UISchemaElement,
} from '@jsonforms/core';

import type { FieldOption, PremadeFieldKind } from './field-catalog';

/**
 * 2D layout of the form: an array of rows, each row a list of field
 * instance ids in display order. A field per row → single-column block;
 * several ids in one row → side-by-side horizontal layout.
 */
export type RowLayout = string[][];

export interface FieldInstanceProps {
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[];
}

export interface FieldInstance {
  instanceId: string;
  typeId: string;
  kind: PremadeFieldKind;
  props: FieldInstanceProps;
}

export interface RequiredOneOfRule {
  id: string;
  type: 'requiredOneOf';
  fieldIds: string[];
}

export type ValidationRule = RequiredOneOfRule;

export interface BuilderOutput {
  schema: JsonSchema;
  uischema: Layout;
}

const schemaFragmentForKind = (
  kind: PremadeFieldKind,
  options?: FieldOption[],
): JsonSchema => {
  switch (kind) {
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'enum':
      return {
        type: 'string',
        enum: options?.map((option) => option.value) ?? [],
      };
    case 'date':
      return { type: 'string', format: 'date' };
    case 'string':
    case 'textarea':
    case 'file':
      return { type: 'string' };
  }
};

const controlFor = (field: FieldInstance): ControlElement => ({
  type: 'Control',
  scope: `#/properties/${field.props.name}`,
  label: field.props.label,
  options: {
    ...(field.props.placeholder
      ? { placeholder: field.props.placeholder }
      : {}),
    ...(field.kind === 'textarea' ? { multi: true } : {}),
    ...(field.kind === 'file' ? { file: true } : {}),
  },
});

export const generateBuilderOutput = (
  fields: FieldInstance[],
  layout: RowLayout,
  rules: ValidationRule[],
): BuilderOutput => {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const field of fields) {
    properties[field.props.name] = schemaFragmentForKind(
      field.kind,
      field.props.options,
    );
    if (field.props.required) {
      required.push(field.props.name);
    }
  }

  const existingIds = new Set(fields.map((field) => field.instanceId));
  const nameById = new Map(
    fields.map((field) => [field.instanceId, field.props.name]),
  );
  const anyOf = rules
    .filter((rule) => rule.type === 'requiredOneOf')
    .map((rule) =>
      rule.fieldIds
        .filter((id) => existingIds.has(id))
        .map((id) => nameById.get(id))
        .filter((name): name is string => Boolean(name)),
    )
    .filter((fieldNames) => fieldNames.length >= 2)
    .map((fieldNames) => ({ required: fieldNames }));

  const schema = {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
    ...(anyOf.length > 0 ? { anyOf } : {}),
  } as JsonSchema;

  const fieldsById = new Map(fields.map((field) => [field.instanceId, field]));
  const elements: UISchemaElement[] = layout.flatMap((row) => {
    const controls = row
      .map((id) => fieldsById.get(id))
      .filter((field): field is FieldInstance => Boolean(field))
      .map(controlFor);
    if (controls.length === 0) {
      return [];
    }
    return [{ type: 'HorizontalLayout', elements: controls }];
  });

  const uischema: Layout = {
    type: 'VerticalLayout',
    elements,
  };

  return { schema, uischema };
};
