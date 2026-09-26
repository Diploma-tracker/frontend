import { useEffect, useMemo, useState } from 'react';

import { type Atom, atom, computed, effect } from '@reatom/core';
import { useAtom } from '@reatom/react';

import type { FieldOption, PremadeField } from './field-catalog';
import type {
  FieldInstance,
  FieldInstanceProps,
  RowLayout,
  ValidationRule,
} from './schema-generator';
import { generateBuilderOutput } from './schema-generator';

export type BuilderTab = 'build' | 'preview';

export const fieldsAtom = atom<FieldInstance[]>(
  [],
  'formBuilder.fields',
).extend((target) => ({
  get: (id: string) => target().find((item) => item.instanceId === id) ?? null,
  has: (id: string) => !!target().find((item) => item.instanceId === id),
}));
export const layoutAtom = atom<RowLayout>([], 'formBuilder.layout');
export const selectedFieldIdAtom = atom<string | null>(
  null,
  'formBuilder.selectedFieldId',
);
export const activeTabAtom = atom<BuilderTab>('build', 'formBuilder.activeTab');
export const rulesAtom = atom<ValidationRule[]>([], 'formBuilder.rules');
export const previewDataAtom = atom<Record<string, unknown>>(
  {},
  'formBuilder.previewData',
);
export const previewMarkedFieldIdsAtom = atom<string[]>(
  [],
  'formBuilder.previewMarkedFields',
);

const createId = (): string => globalThis.crypto.randomUUID();

const insertAt = <T>(array: T[], index: number, item: T): T[] => {
  const next = [...array];
  next.splice(index, 0, item);
  return next;
};

type TransactionalAtom<T> = Atom<T> & {
  commit: () => void;
  rollback: () => void;
};

const createAtomWithCommit = <T>(src: Atom<T>): TransactionalAtom<T> =>
  atom<T>(src()).extend((target) => ({
    commit: () => target.set(src()),
    rollback: () => src.set(target()),
  }));

function createAtomsWithCommit<const A extends readonly Atom<unknown>[]>(
  ...srcAtoms: A
): [{ [K in keyof A]: A[K] }, () => void, () => void] {
  const atoms = srcAtoms.map((src) => createAtomWithCommit(src));

  const commit = () => {
    for (const resultAtom of atoms) {
      resultAtom.commit();
    }
  };

  const rollback = () => {
    for (const resultAtom of atoms) {
      resultAtom.rollback();
    }
  };

  return [atoms as { [K in keyof A]: A[K] }, commit, rollback];
}

const [
  [layoutAtomResult, fieldsAtomResult, rulesAtomResult],
  commitBuilderState,
  rollbackBuilderState,
] = createAtomsWithCommit(layoutAtom, fieldsAtom, rulesAtom);

export const commit = commitBuilderState;
export const rollback = rollbackBuilderState;

/**
 * Where a field ends up when added (or moved):
 * - `{ kind: 'insertInRow', rowIndex, index }` → inside an existing row
 * - `{ kind: 'addNewRow', afterRowIndex }` → as a new row after that row
 * - `{ kind: 'addNewRowInBottom' }` → at the very end
 */
export type AddTarget =
  | { kind: 'insertInRow'; rowIndex: number; index: number }
  | { kind: 'addNewRow'; afterRowIndex: number }
  | { kind: 'addNewRowInBottom' };

const rowIndexOf = (layout: RowLayout, instanceId: string): number =>
  layout.findIndex((row) => row.includes(instanceId));

/** Removes `instanceId` from the layout (drops the row if it becomes empty). */
const removeFromLayout = (layout: RowLayout, instanceId: string): RowLayout =>
  layout
    .map((row) => row.filter((id) => id !== instanceId))
    .filter((row) => row.length > 0);

const addNewRowInBottom = (
  layout: RowLayout,
  instanceId: string,
): RowLayout => {
  layout.push([instanceId]);
  return layout;
};

const addNewRow = (
  layout: RowLayout,
  instanceId: string,
  target: Extract<AddTarget, { kind: 'addNewRow' }>,
): RowLayout => {
  const insertIndex = Math.min(
    Math.max(target.afterRowIndex + 1, 0),
    layout.length,
  );
  layout.splice(insertIndex, 0, [instanceId]);
  return layout;
};

const insertInRow = (
  layout: RowLayout,
  instanceId: string,
  target: Extract<AddTarget, { kind: 'insertInRow' }>,
): RowLayout => {
  if (layout.length === 0) {
    return addNewRowInBottom(layout, instanceId);
  }

  // `rowIndex === layout.length` is the row right below the last one. Targets
  // are resolved against the layout as it is now, but the field is removed
  // before it is inserted again, so a target pointing at the row the field is
  // leaving ends up one row past the end. Appending keeps it meaning "that
  // row" instead of snapping back into the last existing one, which is what
  // makes the field jump between two rows while the pointer does not move.
  const rowIndex = Math.min(Math.max(target.rowIndex, 0), layout.length);
  if (rowIndex === layout.length) {
    layout.push([instanceId]);
    return layout;
  }

  const row = layout[rowIndex];
  if (!row) {
    return layout;
  }

  const index = Math.min(Math.max(target.index, 0), row.length);
  layout[rowIndex] = insertAt(row, index, instanceId);
  return layout;
};

/** Inserts `instanceId` into the layout according to `target`. */
const placeInLayout = (
  layout: RowLayout,
  instanceId: string,
  target: AddTarget,
): RowLayout => {
  const next = layout.map((row) => [...row]);

  switch (target.kind) {
    case 'insertInRow':
      return insertInRow(next, instanceId, target);
    case 'addNewRow':
      return addNewRow(next, instanceId, target);
    case 'addNewRowInBottom':
      return addNewRowInBottom(next, instanceId);
  }
};

export const addField = (field: PremadeField) => {
  const baseName = field.typeId;
  const existingNames = new Set(fieldsAtom().map((item) => item.props.name));
  let name = baseName;
  let suffix = 2;
  while (existingNames.has(name)) {
    name = `${baseName}_${suffix}`;
    suffix += 1;
  }

  const instance: FieldInstance = {
    instanceId: createId(),
    typeId: field.typeId,
    kind: field.kind,
    props: {
      name,
      label: field.label,
      placeholder: field.defaultPlaceholder,
      required: false,
      options: field.options,
    },
  };

  fieldsAtom.set((current) => [...current, instance]);
  return instance;
};

export const placeField = (
  field: PremadeField,
  target: AddTarget = { kind: 'addNewRowInBottom' },
): FieldInstance => {
  const instance = addField(field);
  layoutAtom.set((current) =>
    placeInLayout(current, instance.instanceId, target),
  );
  selectedFieldIdAtom.set(instance.instanceId);
  return instance;
};

/**
 * Moves an existing field by removing it from the layout and re-adding it at
 * `target` (the only two operations: remove + add).
 *
 * `target` addresses the layout *after* the removal, so a row that disappears
 * because its only field moved away shifts the requested row up by one, and a
 * field moving right inside its own row lands one slot earlier.
 */
export const moveFieldWTF = (
  instanceId: string,
  target: AddTarget = { kind: 'addNewRowInBottom' },
): void => {
  const layout = layoutAtom();
  const sourceRowIndex = rowIndexOf(layout, instanceId);
  const sourceIndex = layout[sourceRowIndex]?.indexOf(instanceId) ?? -1;

  const cleared = layout.map((row) => row.filter((id) => id !== instanceId));
  const sourceRowCleared =
    sourceRowIndex !== -1 && cleared[sourceRowIndex]?.length === 0;

  let resolved = target;
  if (sourceRowCleared) {
    if (target.kind === 'insertInRow' && target.rowIndex > sourceRowIndex) {
      resolved = { ...target, rowIndex: target.rowIndex - 1 };
    }
    if (target.kind === 'addNewRow' && target.afterRowIndex > sourceRowIndex) {
      resolved = { ...target, afterRowIndex: target.afterRowIndex - 1 };
    }
  } else if (
    target.kind === 'insertInRow' &&
    target.rowIndex === sourceRowIndex &&
    sourceIndex !== -1 &&
    target.index > sourceIndex
  ) {
    resolved = { ...target, index: target.index - 1 };
  }

  layoutAtom.set(
    placeInLayout(
      cleared.filter((row) => row.length > 0),
      instanceId,
      resolved,
    ),
  );
};

const sameLayout = (a: RowLayout, b: RowLayout): boolean => {
  if (a.length !== b.length) return false;

  return a.every((row, rowIndex) => {
    const other = b[rowIndex];
    if (!other || other.length !== row.length) return false;
    return row.every((id, col) => id === other[col]);
  });
};

/**
 * Moves an existing field by removing it from the layout and adding it at
 * `target`.
 *
 * A target that is already satisfied must keep the very same array: writing an
 * equal-but-new layout re-renders the canvas, which re-measures every
 * droppable, which fires `onDragOver` again — and the write is the fuel that
 * loop runs on.
 */
export const moveField = (
  instanceId: string,
  target: AddTarget = { kind: 'addNewRowInBottom' },
): void => {
  layoutAtom.set((layout) => {
    const next = placeInLayout(
      removeFromLayout(layout, instanceId),
      instanceId,
      target,
    );

    return sameLayout(layout, next) ? layout : next;
  });
};

export const unplaceField = (instanceId: string): void => {
  layoutAtom.set((layout) => {
    const next = removeFromLayout(layout, instanceId);

    return sameLayout(layout, next) ? layout : next;
  });
};

/** Removes a field (from fields, layout, rules) for good. */
export const removeField = (instanceId: string): void => {
  fieldsAtom.set((current) =>
    current.filter((field) => field.instanceId !== instanceId),
  );
  layoutAtom.set((current) => removeFromLayout(current, instanceId));
  rulesAtom.set((current) =>
    current
      .map((rule) => ({
        ...rule,
        fieldIds: rule.fieldIds.filter((id) => id !== instanceId),
      }))
      .filter((rule) => rule.fieldIds.length >= 2),
  );
  selectedFieldIdAtom.set((selected) =>
    selected === instanceId ? null : selected,
  );
};

export const updateFieldProps = (
  instanceId: string,
  patch: Partial<FieldInstanceProps>,
): void => {
  fieldsAtom.set((current) =>
    current.map((field) =>
      field.instanceId === instanceId
        ? { ...field, props: { ...field.props, ...patch } }
        : field,
    ),
  );
};

export const updateFieldOptions = (
  instanceId: string,
  options: FieldOption[],
): void => {
  fieldsAtom.set((current) =>
    current.map((field) =>
      field.instanceId === instanceId
        ? { ...field, props: { ...field.props, options } }
        : field,
    ),
  );
};

export const selectField = (instanceId: string | null): void => {
  selectedFieldIdAtom.set(instanceId);
};

export const setActiveTab = (tab: BuilderTab): void => {
  activeTabAtom.set(tab);
};

export const createRuleId = (): string => globalThis.crypto.randomUUID();

export const addRule = (rule: ValidationRule): void => {
  rulesAtom.set((current) => [...current, rule]);
};

export const removeRule = (ruleId: string): void => {
  rulesAtom.set((current) => current.filter((rule) => rule.id !== ruleId));
};

export const builderOutput = computed(
  () =>
    generateBuilderOutput(
      fieldsAtomResult(),
      layoutAtomResult(),
      rulesAtomResult(),
    ),
  'formBuilder.output',
);

effect(() => {
  const output = builderOutput();
  console.debug('[form-builder] JSON Schema:', output.schema);
  console.debug('[form-builder] UI Schema:', output.uischema);
}, 'formBuilder.outputLog');

export interface BuilderPreviewState {
  data: Record<string, unknown>;
  setData: (data: Record<string, unknown>) => void;
  violatedRules: ValidationRule[];
}

const isFieldFilled = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

export const useBuilderPreview = (): BuilderPreviewState => {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [fields] = useAtom(fieldsAtom);
  const [rules] = useAtom(rulesAtom);

  const refsByInstanceId = useMemo(() => {
    const map = new Map<string, string>();
    for (const field of fields) {
      map.set(field.instanceId, field.props.name);
    }
    return map;
  }, [fields]);

  const activeRules = useMemo(
    () =>
      rules.filter((rule) =>
        rule.fieldIds.every((id) => refsByInstanceId.has(id)),
      ),
    [rules, refsByInstanceId],
  );

  const { violatedRules, markedPaths } = useMemo(() => {
    const violated: ValidationRule[] = [];
    for (const rule of activeRules) {
      const filled = rule.fieldIds.some((id) => {
        const path = refsByInstanceId.get(id);
        return path !== undefined && isFieldFilled(data[path]);
      });
      if (!filled) {
        violated.push(rule);
      }
    }

    const markedPaths = new Set<string>();
    for (const rule of violated) {
      for (const id of rule.fieldIds) {
        const path = refsByInstanceId.get(id);
        if (path) {
          markedPaths.add(path);
        }
      }
    }

    return { violatedRules: violated, markedPaths: [...markedPaths] };
  }, [activeRules, data, refsByInstanceId]);

  useEffect(() => {
    previewDataAtom.set(data);
  }, [data]);

  useEffect(() => {
    previewMarkedFieldIdsAtom.set(markedPaths);
  }, [markedPaths]);

  return { data, setData, violatedRules };
};
