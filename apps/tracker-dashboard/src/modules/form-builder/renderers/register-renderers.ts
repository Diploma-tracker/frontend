import type { JsonFormsRendererRegistryEntry } from '@jsonforms/core';
import {
  isBooleanControl,
  isControl,
  isDateControl,
  isEnumControl,
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
  UiKitNumberControl,
  UiKitTextControl,
  UiKitTextareaControl,
  UiKitVerticalLayout,
} from './ui-kit-renderers';

const isFileControl = (uischema: unknown): boolean => {
  if (!isControl(uischema as never)) {
    return false;
  }
  const options = (uischema as { options?: Record<string, unknown> }).options;
  return options?.file === true;
};

export const formBuilderRenderers: JsonFormsRendererRegistryEntry[] = [
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
  { tester: rankWith(3, isNumberControl), renderer: UiKitNumberControl },
  { tester: rankWith(3, isMultiLineControl), renderer: UiKitTextareaControl },
  { tester: rankWith(3, isBooleanControl), renderer: UiKitBooleanControl },
  { tester: rankWith(2, isStringControl), renderer: UiKitTextControl },
];
