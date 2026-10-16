import type { ElementType } from 'react';

import { k } from '@/shared/utils/i18n';
import {
  CalendarIcon,
  CheckIcon,
  HashIcon,
  StarIcon,
  TextTIcon,
} from '@phosphor-icons/react';

import type { ProjectFieldType } from './types';

export interface AvailableFieldType {
  type: ProjectFieldType;
  icon: ElementType;
  supportsValidation: boolean;
}

/**
 * TODO: Replace with the set of premade/available fields returned by the
 * backend. Components must only rely on the `AvailableFieldType` contract so
 * that swapping the source is the only change needed.
 */
const availableFieldTypes: AvailableFieldType[] = [
  { type: 'string', icon: TextTIcon, supportsValidation: true },
  { type: 'number', icon: HashIcon, supportsValidation: true },
  { type: 'bool', icon: CheckIcon, supportsValidation: false },
  { type: 'grade', icon: StarIcon, supportsValidation: false },
  { type: 'date', icon: CalendarIcon, supportsValidation: false },
];

export const AVAILABLE_FIELD_TYPES_BY_TYPE: Record<
  ProjectFieldType,
  AvailableFieldType
> = Object.fromEntries(
  availableFieldTypes.map((entry) => [entry.type, entry]),
) as Record<ProjectFieldType, AvailableFieldType>;

export const fieldTypeLabelKeys: Record<ProjectFieldType, string> = {
  string: k('projectDefinition.types.string'),
  number: k('projectDefinition.types.number'),
  bool: k('projectDefinition.types.bool'),
  grade: k('projectDefinition.types.grade'),
  date: k('projectDefinition.types.date'),
};
