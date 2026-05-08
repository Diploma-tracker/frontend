import { type ReactNode, useState } from 'react';

import { UserAvatar } from '@/modules/user';
import { DetailsModal } from '@/shared/components';
import { T, useTranslation } from '@/shared/utils/i18n';
import {
  CheckCircleIcon,
  ClockIcon,
  UserCheckIcon,
  UserCircleDashedIcon,
  UserMinusIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@repo/ui-kit/components/common/layout/item';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';

import { type TeacherDTO } from '../../../models';

// eslint-disable-next-line react-refresh/only-export-components
const NameCell = ({ teacher }: { teacher: TeacherDTO }) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const acceptedStudentApplications =
    teacher.applications?.filter((app) => app.status === 'ACCEPTED') ?? [];

  const rejectedStudentApplications =
    teacher.applications?.filter((app) => app.status === 'REJECTED') ?? [];

  const pendingStudentApplications =
    teacher.applications?.filter((app) => app.status === 'PENDING') ?? [];

  const totalApplications = teacher.applications?.length ?? 0;

  const handleOpenModal = () => {
    setOpen(true);
  };

  const renderApplicationsList = (
    applications: TeacherDTO['applications'],
    emptyTitle: string,
    emptyIcon: ReactNode,
  ) => {
    if (!applications?.length) {
      return (
        <Empty className="min-h-44 border border-dashed bg-muted/25 p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">{emptyIcon}</EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <ItemGroup className="gap-2">
        {applications.map((application) => (
          <Item
            key={application.id}
            variant="outline"
            className="bg-background/80"
          >
            <ItemMedia>
              <UserAvatar userId={application.student.id} className="size-10" />
            </ItemMedia>

            <ItemContent className="min-w-0">
              <ItemTitle>
                <span className="truncate">
                  {application.student.firstName} {application.student.lastName}
                </span>
              </ItemTitle>

              <ItemDescription className="truncate">
                {application.student.email}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    );
  };

  return (
    <>
      <div
        onClick={handleOpenModal}
        className="-m-2 block cursor-pointer p-2 font-medium"
      >
        {teacher.firstName} {teacher.lastName}
      </div>

      <DetailsModal
        open={open}
        onOpenChange={setOpen}
        title={t('projectEnrollment.teacher.detailsModal.title')}
        className="xl:max-w-6xl"
      >
        <div className="space-y-6">
          <div className="border bg-muted/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('projectEnrollment.teacher.detailsModal.teacherLabel')}
                </p>
                <p className="text-lg font-semibold">
                  {teacher.firstName} {teacher.lastName}
                </p>
                <p>{teacher.email}</p>
              </div>

              <Badge className="tabular-nums">
                {t('projectEnrollment.teacher.detailsModal.totalApplications')}:{' '}
                {totalApplications}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircleIcon className="size-4 text-success" />
                  <p className="text-sm font-semibold">
                    {t(
                      'projectEnrollment.teacher.detailsModal.sections.accepted.title',
                    )}
                  </p>
                </div>
                <Badge intent="success" className="tabular-nums">
                  {acceptedStudentApplications.length}
                </Badge>
              </div>

              {renderApplicationsList(
                acceptedStudentApplications,
                t(
                  'projectEnrollment.teacher.detailsModal.sections.accepted.emptyTitle',
                ),
                <UserCheckIcon />,
              )}
            </div>

            <div className="space-y-3 border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="size-4 text-pending" />
                  <p className="text-sm font-semibold">
                    {t(
                      'projectEnrollment.teacher.detailsModal.sections.pending.title',
                    )}
                  </p>
                </div>
                <Badge intent="pending" className="tabular-nums">
                  {pendingStudentApplications.length}
                </Badge>
              </div>

              {renderApplicationsList(
                pendingStudentApplications,
                t(
                  'projectEnrollment.teacher.detailsModal.sections.pending.emptyTitle',
                ),
                <UserCircleDashedIcon />,
              )}
            </div>

            <div className="space-y-3 border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <XCircleIcon className="size-4 text-destructive" />
                  <p className="text-sm font-semibold">
                    {t(
                      'projectEnrollment.teacher.detailsModal.sections.rejected.title',
                    )}
                  </p>
                </div>
                <Badge intent="destructive" className="tabular-nums">
                  {rejectedStudentApplications.length}
                </Badge>
              </div>

              {renderApplicationsList(
                rejectedStudentApplications,
                t(
                  'projectEnrollment.teacher.detailsModal.sections.rejected.emptyTitle',
                ),
                <UserMinusIcon />,
              )}
            </div>
          </div>
        </div>
      </DetailsModal>
    </>
  );
};

export const TeacherNameWithDetailsModalColumn: ColumnDef<TeacherDTO> = {
  id: 'name',
  header: () => <T k="projectEnrollment.teacher.table.columns.name" />,
  cell: ({ row }) => <NameCell teacher={row.original} />,
};
