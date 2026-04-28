import { T } from '@/shared/components';
import { t } from '@/shared/utils/i18n';
import { calculatePercentage, formatPercentageString } from '@/shared/utils/percentage';
import { UserCircleDashedIcon } from '@phosphor-icons/react';
import { type ColumnDef } from '@tanstack/react-table';

import type { SupervisionApplicationStatus, TeacherDTO } from '@repo/api/model';
import { Badge, type BadgeProps } from '@repo/ui-kit/components/common/data-display/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui-kit/components/common/layout/hover-card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { Progress } from '@repo/ui-kit/components/common/states/progress';
import { cn } from '@repo/ui-kit/lib/utils';

import { teacherApplicationsStatusMap } from '../../../models';

const STATUS_META: Record<
  SupervisionApplicationStatus,
  {
    labelKey: string;
    intent: BadgeProps['intent'];
    textClassName: string;
    progressClassName: string;
  }
> = {
  PENDING: {
    labelKey: 'projectEnrollment.teacher.applicationsCell.status.pending',
    intent: 'pending',
    textClassName: 'text-pending',
    progressClassName: 'bg-pending/15 [&_[data-slot=progress-indicator]]:bg-pending',
  },
  ACCEPTED: {
    labelKey: 'projectEnrollment.teacher.applicationsCell.status.accepted',
    intent: 'success',
    textClassName: 'text-success',
    progressClassName: 'bg-success/15 [&_[data-slot=progress-indicator]]:bg-success',
  },
  REJECTED: {
    labelKey: 'projectEnrollment.teacher.applicationsCell.status.rejected',
    intent: 'destructive',
    textClassName: 'text-destructive',
    progressClassName: 'bg-destructive/15 [&_[data-slot=progress-indicator]]:bg-destructive',
  },
};

const STATUS_ORDER: SupervisionApplicationStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED'];

// eslint-disable-next-line react-refresh/only-export-components
const ApplicationsCell = ({ teacher }: { teacher: TeacherDTO }) => {
  const stats = teacherApplicationsStatusMap(teacher.id);

  if (!stats) {
    return <span className="text-muted-foreground">—</span>;
  }

  const { countByStatus, total } = stats;

  const statusSummary = STATUS_ORDER.map((status) => {
    const value = countByStatus[status];
    const percent = calculatePercentage(value, total);

    return {
      status,
      value,
      percent,
      label: t(STATUS_META[status].labelKey),
      ...STATUS_META[status],
    };
  });

  const renderEmptyState = () => {
    return (
      <Empty className="p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserCircleDashedIcon />
          </EmptyMedia>
          <EmptyTitle>
            <T k="projectEnrollment.teacher.applicationsCell.empty.title" />
          </EmptyTitle>
          <EmptyDescription>
            <T k="projectEnrollment.teacher.applicationsCell.empty.description" />
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  };

  const renderHoverCardContent = () => {
    return (
      <>
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                <T k="projectEnrollment.teacher.applicationsCell.overview.title" />
              </p>
              <p className="text-sm text-muted-foreground">
                <T k="projectEnrollment.teacher.applicationsCell.overview.subtitle" />
              </p>
            </div>

            <Badge className="tabular-nums">
              {total} {t('projectEnrollment.teacher.applicationsCell.overview.totalSuffix')}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {statusSummary.map(({ status, label, textClassName, progressClassName, value, percent }) => (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className={cn('text-sm font-medium uppercase', textClassName)}>{label}</span>

                <span className="text-sm text-muted-foreground tabular-nums">
                  <span className="font-semibold text-foreground">{value}</span>
                  {' / '}
                  {total}
                  <span className="ml-1.5 text-sm">{formatPercentageString(percent)}</span>
                </span>
              </div>

              <Progress value={percent} className={progressClassName} />
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild className="cursor-pointer">
        <Badge className="tabular-nums">{total}</Badge>
      </HoverCardTrigger>

      <HoverCardContent side="top" align="end" className="w-80 space-y-4 p-4">
        {total > 0 ? renderHoverCardContent() : renderEmptyState()}
      </HoverCardContent>
    </HoverCard>
  );
};

export const TeacherApplicationsColumn: ColumnDef<TeacherDTO> = {
  id: 'applications',
  header: () => <T k="projectEnrollment.teacher.table.columns.applications" />,
  cell: ({ row }) => <ApplicationsCell teacher={row.original} />,
};
