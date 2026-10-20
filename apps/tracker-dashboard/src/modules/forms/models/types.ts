import type { JsonSchema, Layout } from '@jsonforms/core';

export type RowLayout = string[][];

/**
 * JSON Schema з бекенду, яка може містити кастомні ключові слова `x-*`
 * (напр. `x-file-types`), нестандартні для draft-07. Бекенд використовує
 * `ProjectFieldSchemaValidator` з python-jsonschema, який розширений такими
 * ключовими словами.
 */
export type ProjectFieldSchema = JsonSchema & Record<string, unknown>;

/**
 * UI-категорія контролу, яку бекенд віддає разом із типом поля. UI мапит
 * `kind` на конкретний контрол і не вгадує його з JSON Schema. Може
 * відрізнятися від `name` там, де кілька доменних типів ділять один контрол
 * (напр. `grade` рендериться як integer-поле).
 */
export type FieldKind = 'string' | 'integer' | 'boolean' | 'file';

/**
 * Тип поля з бекенду — ім'я, UI-категорія контролу та JSON-схема значення.
 * Схема надходить з бекенду (ProjectFieldDefinition.validation_schema), нічого
 * не хардкодиться на фронтенді.
 */
export interface ProjectFieldDefinition {
  name: string;
  kind: FieldKind;
  schema: ProjectFieldSchema;
}

/**
 * Поле, яке користувач конструює в білдері. `name` посилається на
 * ProjectFieldDefinition.name.
 */
export interface FormField {
  name: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface OneOfRequiredRule {
  id: string;
  type: 'one_of_required';
  field_names: string[];
}

export type ValidationRule = OneOfRequiredRule;

/**
 * Вихід білдера — generalized форма: назва, поля, правила, ui, розкладка.
 */
export interface FormDefinition {
  name: string;
  fields: FormField[];
  validation_rules: ValidationRule[];
  ui: RowLayout;
}

/**
 * Повний вихід білдера: JSON Schema + uiSchema. Schema-фрагменти беруться з
 * ProjectFieldDefinition.schema (надходить з бекенду), uiSchema — з layout.
 */
export interface BuilderOutput {
  schema: JsonSchema;
  uischema: Layout;
}
