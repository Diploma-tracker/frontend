import { createContext, useContext } from 'react';

/**
 * Field paths that a host wants to visually highlight inside a JSON Forms
 * tree. The renderers are domain-neutral, so the host decides what "marked"
 * means (e.g. the builder marks fields that violate a validation rule) and
 * feeds the paths in through `JsonFormsMarkedFieldsProvider`.
 */
export const MarkedFieldsContext = createContext<readonly string[]>([]);

export const useMarkedField = (path: string): boolean =>
  useContext(MarkedFieldsContext).includes(path);
