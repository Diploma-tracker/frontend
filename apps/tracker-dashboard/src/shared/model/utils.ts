import type { FieldArrayAtom } from '@reatom/core';

export const setArrayField = (field: FieldArrayAtom<string, string>, value: string[]) => {
  field.clear();
  field.createMany(value.map((v) => [v]));
};
