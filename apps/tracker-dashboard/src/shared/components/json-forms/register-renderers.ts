import type {
  JsonFormsRendererRegistryEntry,
  UISchemaElement,
} from '@jsonforms/core';
import {
  isBooleanControl,
  isControl,
  isDateControl,
  isEnumControl,
  isIntegerControl,
  isMultiLineControl,
  isNumberControl,
  isStringControl,
  rankWith,
  uiTypeIs,
} from '@jsonforms/core';

import {
  UiKitBooleanControl,
  UiKitDateControl,
  UiKitEnumControl,
  UiKitFileControl,
  UiKitHorizontalLayout,
  UiKitIntegerControl,
  UiKitNumberControl,
  UiKitTextControl,
  UiKitTextareaControl,
  UiKitVerticalLayout,
} from './ui-kit-renderers';

/**
 * The backend marks a field's control kind via `options.file` in the uiSchema
 * (generated from the domain `kind`), so the renderer never inspects the JSON
 * Schema for custom keywords.
 */
const isFileControl = (uischema: UISchemaElement): boolean => {
  if (!isControl(uischema)) {
    return false;
  }
  const options = (uischema as { options?: Record<string, unknown> }).options;
  return options?.file === true;
};

export const jsonFormsRenderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: rankWith(1, uiTypeIs('VerticalLayout')),
    renderer: UiKitVerticalLayout,
  },
  {
    tester: rankWith(1, uiTypeIs('HorizontalLayout')),
    renderer: UiKitHorizontalLayout,
  },
  { tester: rankWith(4, isFileControl), renderer: UiKitFileControl },
  { tester: rankWith(3, isDateControl), renderer: UiKitDateControl },
  { tester: rankWith(3, isEnumControl), renderer: UiKitEnumControl },
  { tester: rankWith(3, isIntegerControl), renderer: UiKitIntegerControl },
  { tester: rankWith(3, isNumberControl), renderer: UiKitNumberControl },
  { tester: rankWith(3, isMultiLineControl), renderer: UiKitTextareaControl },
  { tester: rankWith(3, isBooleanControl), renderer: UiKitBooleanControl },
  { tester: rankWith(2, isStringControl), renderer: UiKitTextControl },
];
