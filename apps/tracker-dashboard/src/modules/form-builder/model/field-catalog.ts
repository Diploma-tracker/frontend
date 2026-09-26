import {
  CalendarBlankIcon,
  CheckSquareIcon,
  FileArrowUpIcon,
  HashIcon,
  ListChecksIcon,
  TextAlignJustifyIcon,
  TextTIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { atom } from '@reatom/core';

export type PremadeFieldKind =
  | 'string'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'date'
  | 'file';

export interface FieldOption {
  value: string;
  label: string;
}

export interface PremadeField {
  typeId: string;
  kind: PremadeFieldKind;
  label: string;
  description: string;
  icon: Icon;
  defaultPlaceholder?: string;
  options?: FieldOption[];
}

// TODO: Replace with a backend request once the real field catalog is
// available. Renderer/canvas code must only depend on the `PremadeField`
// contract so that swapping the loader is the only change needed.
const mockCatalog: PremadeField[] = [
  {
    typeId: 'text',
    kind: 'string',
    label: 'Text',
    description: 'Single-line text input',
    icon: TextTIcon,
    defaultPlaceholder: 'Type here...',
  },
  {
    typeId: 'textarea',
    kind: 'textarea',
    label: 'Text area',
    description: 'Multi-line text input',
    icon: TextAlignJustifyIcon,
    defaultPlaceholder: 'Type here...',
  },
  {
    typeId: 'number',
    kind: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: HashIcon,
    defaultPlaceholder: '0',
  },
  {
    typeId: 'checkbox',
    kind: 'boolean',
    label: 'Checkbox',
    description: 'Boolean flag',
    icon: CheckSquareIcon,
  },
  {
    typeId: 'select',
    kind: 'enum',
    label: 'Select',
    description: 'Pick one value from a list',
    icon: ListChecksIcon,
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
  {
    typeId: 'date',
    kind: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: CalendarBlankIcon,
  },
  {
    typeId: 'file',
    kind: 'file',
    label: 'File',
    description: 'File upload',
    icon: FileArrowUpIcon,
  },
];

export const catalogAtom = atom(mockCatalog);
