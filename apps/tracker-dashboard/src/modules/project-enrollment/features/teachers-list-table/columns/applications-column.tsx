import { T } from '@/shared/components';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicationStatus, TeacherDTO } from '@repo/api/model';

const STATUS_STYLES: Record<SupervisionApplicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
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
        <span
          key={status}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {counts[status]}
        </span>
      ))}
    </div>
  );
};

export const TeacherApplicationsColumn: ColumnDef<TeacherDTO> = {
  id: 'applications',
  header: () => <T k="projectEnrollment.teacher.table.columns.applications" />,
  cell: ({ row }) => <ApplicationsCell teacher={row.original} />,
};
