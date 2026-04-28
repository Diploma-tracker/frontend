import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicationStatus, TeacherDTO } from '@repo/api/model';
import { Badge, type BadgeProps } from '@repo/ui-kit/components/common/data-display/badge';

const STATUS_STYLES: Record<SupervisionApplicationStatus, BadgeProps['intent']> = {
  PENDING: 'pending',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
};

// eslint-disable-next-line react-refresh/only-export-components
const ApplicationsCell = ({ teacher }: { teacher: TeacherDTO }) => {
  if (!teacher.isSelected) {
    return <span className="text-muted-foreground">—</span>;
  }

  const counts: Record<SupervisionApplicationStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  };

  for (const app of teacher.applications ?? []) {
    counts[app.status as SupervisionApplicationStatus] = (counts[app.status as SupervisionApplicationStatus] ?? 0) + 1;
  }

  return (
    <div className="flex items-center gap-1.5">
      {(['PENDING', 'ACCEPTED', 'REJECTED'] as SupervisionApplicationStatus[]).map((status) => (
        <Badge key={status} variant="outline" intent={STATUS_STYLES[status]}>
          {counts[status]}
        </Badge>
      ))}
    </div>
  );
};

export const TeacherApplicationsColumn: ColumnDef<TeacherDTO> = {
  id: 'applications',
  header: () => <T k="projectEnrollment.teacher.table.columns.applications" />,
  cell: ({ row }) => <ApplicationsCell teacher={row.original} />,
};
