import { T } from '@/shared/utils/i18n';
import { type ColumnDef } from '@tanstack/react-table';

import type { BachelorThesisDTO } from '../../../models';

export const ThesisTopicColumn: ColumnDef<BachelorThesisDTO> = {
  id: 'thesisTopic',
  header: () => (
    <T k="projectEnrollment.bachelorTheses.table.columns.thesisTopic" />
  ),
  cell: ({ row }) => {
    const topic = row.original.topic;
    if (!topic) {
      return (
        <span className="text-muted-foreground italic">
          <T k="projectEnrollment.bachelorTheses.table.noTopic" />
        </span>
      );
    }
    return <span>{topic.en}</span>;
  },
};
