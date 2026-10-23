import { createAtomsWithCommit } from '@/shared/model/transaction';
import { action, atom, computed } from '@reatom/core';

import { catalogAtom } from './field-catalog';
import {
  type AddTarget,
  placeInLayout,
  removeFromLayout,
  sameLayout,
} from './layout';
import { generateFormFromDomain } from './schema-generator';
import type {
  FormDefinition,
  FormField,
  ProjectFieldDefinition,
  RowLayout,
  ValidationRule,
} from './types';

export type DragSession = {
  source: 'palette' | 'canvas';
  name: string;
};

// ---------------------------------------------------------------------------
// Atoms
// ---------------------------------------------------------------------------

export const fieldsAtom = atom<FormField[]>([], 'formBuilder.fields').extend(
  (target) => ({
    get: (name: string) => target().find((item) => item.name === name) ?? null,
    has: (name: string) => !!target().find((item) => item.name === name),
  }),
);
export const layoutAtom = atom<RowLayout>([], 'formBuilder.layout');
export const selectedFieldNameAtom = atom<string | null>(
  null,
  'formBuilder.selectedFieldName',
);

export const dragSessionAtom = atom<DragSession | null>(
  null,
  'formBuilder.dragSession',
);

export const dropSessionAtom = atom<DragSession | null>(
  null,
  'formBuilder.dropSession',
);

export const formIdAtom = atom<string>('', 'formBuilder.formId');
export const formNameAtom = atom<string>('', 'formBuilder.formName');
export const rulesAtom = atom<ValidationRule[]>([], 'formBuilder.rules');
export const previewDataAtom = atom<Record<string, unknown>>(
  {},
  'formBuilder.previewData',
);

// ---------------------------------------------------------------------------
// Transactional commit / rollback
// ---------------------------------------------------------------------------

export const createRuleId = (): string => globalThis.crypto.randomUUID();

const [
  [layoutAtomResult, fieldsAtomResult, rulesAtomResult, formNameAtomResult],
  commitBuilderState,
  rollbackBuilderState,
] = createAtomsWithCommit(layoutAtom, fieldsAtom, rulesAtom, formNameAtom);

export const rollback = rollbackBuilderState;

/**
 * A field that is not in the layout does not survive a commit: dragging a
 * field out of the canvas merely unplaces it, and this is what actually drops
 * it — along with its selection and every rule it took part in.
 */
const pruneUnplacedFields = (): void => {
  const placedNames = new Set(layoutAtom().flat());
  const unplacedNames = fieldsAtom()
    .filter((field) => !placedNames.has(field.name))
    .map((field) => field.name);

  if (unplacedNames.length === 0) return;

  fieldsAtom.set((fields) =>
    fields.filter((field) => !unplacedNames.includes(field.name)),
  );
  rulesAtom.set((rules) =>
    rules
      .map((rule) => ({
        ...rule,
        field_names: rule.field_names.filter(
          (name) => !unplacedNames.includes(name),
        ),
      }))
      .filter((rule) => rule.field_names.length >= 2),
  );
  selectedFieldNameAtom.set((selected) =>
    selected && unplacedNames.includes(selected) ? null : selected,
  );
};

export const commit = (): void => {
  pruneUnplacedFields();
  commitBuilderState();
};

export const loadDefinition = action((definition: FormDefinition) => {
  formIdAtom.set(definition.id);
  formNameAtom.set(definition.name);
  fieldsAtom.set(definition.fields);
  layoutAtom.set(definition.ui);
  rulesAtom.set(definition.validation_rules);
  selectedFieldNameAtom.set(null);
  previewDataAtom.set({});
  commit();
}, 'formBuilder.loadDefinition');

// ---------------------------------------------------------------------------
// Field actions
// ---------------------------------------------------------------------------

export const createFormFieldFromDefinition = (
  definition: ProjectFieldDefinition,
): FormField => ({
  name: definition.name,
  label: definition.name,
  kind: definition.kind,
  schema: definition.schema,
  required: false,
});

/**
 * Adds a field instance. `FormField.name` doubles as the catalog type name, so
 * a catalog field can be placed at most once — adding an existing type is a
 * no-op returning the field already on the canvas.
 */
export const addField = (field: FormField): FormField => {
  const existing = fieldsAtom().find((item) => item.name === field.name);
  if (existing) {
    return existing;
  }

  const instance: FormField = { ...field };

  fieldsAtom.set((current) => [...current, instance]);
  return instance;
};

export const placeField = (
  field: FormField,
  target: AddTarget = { kind: 'addNewRowInBottom' },
): FormField => {
  const instance = addField(field);
  layoutAtom.set((current) => placeInLayout(current, instance.name, target));
  selectedFieldNameAtom.set(instance.name);
  return instance;
};

/**
 * Moves an existing field by removing it from the layout and adding it at
 * `target`.
 */
export const moveField = (
  name: string,
  target: AddTarget = { kind: 'addNewRowInBottom' },
): void => {
  layoutAtom.set((layout) => {
    const next = placeInLayout(removeFromLayout(layout, name), name, target);

    return sameLayout(layout, next) ? layout : next;
  });
};

export const unplaceField = (name: string): void => {
  layoutAtom.set((layout) => {
    const next = removeFromLayout(layout, name);

    return sameLayout(layout, next) ? layout : next;
  });
};

/** Removes a field (from fields, layout, rules) for good. */
export const removeField = (name: string): void => {
  fieldsAtom.set((current) => current.filter((field) => field.name !== name));
  layoutAtom.set((current) => removeFromLayout(current, name));
  rulesAtom.set((current) =>
    current
      .map((rule) => ({
        ...rule,
        field_names: rule.field_names.filter((id) => id !== name),
      }))
      .filter((rule) => rule.field_names.length >= 2),
  );
  selectedFieldNameAtom.set((selected) =>
    selected === name ? null : selected,
  );
};

export const updateFieldProps = (
  name: string,
  patch: Partial<FormField>,
): void => {
  fieldsAtom.set((current) =>
    current.map((field) =>
      field.name === name ? { ...field, ...patch } : field,
    ),
  );
};

// ---------------------------------------------------------------------------
// Selection & tabs
// ---------------------------------------------------------------------------

export const selectField = (name: string | null): void => {
  selectedFieldNameAtom.set(name);
};

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export const addRule = (rule: ValidationRule): void => {
  rulesAtom.set((current) => [...current, rule]);
};

export const removeRule = (ruleId: string): void => {
  rulesAtom.set((current) => current.filter((rule) => rule.id !== ruleId));
};

// ---------------------------------------------------------------------------
// Derived output
// ---------------------------------------------------------------------------

/**
 * Поточна конфігурація білдера у формі FormDefinition — це саме те, що
 * відсилаємо на бекенд як результат білдингу (документ таблиці
 * form_definitions).
 */
export const formDefinition = computed<FormDefinition>(
  () => ({
    id: formIdAtom(),
    name: formNameAtomResult(),
    fields: fieldsAtomResult(),
    validation_rules: rulesAtomResult(),
    ui: layoutAtomResult(),
  }),
  'formBuilder.formDefinition',
);

/**
 * JSON Schema + uiSchema для поточної конфігурації білдера. Будується з
 * `formDefinition` + `catalogAtom` (ProjectFieldDefinition.schema надходить з
 * бекенду), а uiSchema — з `layoutAtom` (кожен рядок → HorizontalLayout).
 */
export const builderOutput = computed(
  () => generateFormFromDomain(formDefinition()),
  'formBuilder.output',
);

/**
 * Каталог без типів, чиї поля вже розміщені у формі. Кожен тип можна додати
 * щонайбільше один раз (`addField` не дедуплікує через суфікс), тож палітра
 * показує лише ще не використані типи.
 */
export const availableFieldsAtom = computed(() => {
  const placedNames = new Set(fieldsAtom().map((field) => field.name));
  return catalogAtom().filter((field) => !placedNames.has(field.name));
}, 'formBuilder.availableFields');
