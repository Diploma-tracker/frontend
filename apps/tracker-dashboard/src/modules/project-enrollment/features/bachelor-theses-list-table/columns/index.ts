import { type ColumnDef } from '@tanstack/react-table';

import type { BachelorThesisDTO } from '../../../models';
import { BachelorThesisActionColumn } from './action-column';
import { StudentEmailColumn } from './student-email-column';
import { StudentNameColumn } from './student-name-column';
import { ThesisTopicColumn } from './thesis-topic-column';

export const createBachelorThesisColumns =
  (): ColumnDef<BachelorThesisDTO>[] => [
    StudentNameColumn,
    StudentEmailColumn,
    ThesisTopicColumn,
    BachelorThesisActionColumn,
  ];
