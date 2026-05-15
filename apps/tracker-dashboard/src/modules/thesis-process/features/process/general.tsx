import {
  CheckCircleIcon,
  CircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { CircleDashedIcon } from '@phosphor-icons/react/dist/ssr';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Spinner } from '@repo/ui-kit/components/common/states/spinner';

import type { Stage } from '../../models/bachelor-thesis-process';
import { STATUS_LABELS } from './constants';

const InfoDotVariant = {
  completed: 'completed',
  active: 'active',
  waiting: 'waiting',
  warning: 'warning',
} as const;

export type InfoDotVariant = keyof typeof InfoDotVariant;

export const InfoDot = ({ variant }: { variant: InfoDotVariant }) => {
  const icons = {
    [InfoDotVariant.active]: (
      <CircleIcon size={16} weight="fill" className="shrink-0 text-primary" />
    ),
    [InfoDotVariant.completed]: (
      <CheckCircleIcon
        size={16}
        weight="fill"
        className="shrink-0 text-success"
      />
    ),
    [InfoDotVariant.waiting]: (
      <CircleDashedIcon
        size={16}
        className="shrink-0 text-muted-foreground/30"
      />
    ),
    [InfoDotVariant.warning]: (
      <WarningCircleIcon
        size={16}
        weight="fill"
        className="shrink-0 text-pending"
      />
    ),
  };
  return icons[variant] ?? null;
};

export const StatusBadge = ({ status }: { status: Stage['status'] }) => {
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.waiting;
  return (
    <Badge variant="filled" intent={statusInfo.intent}>
      {statusInfo.label}
    </Badge>
  );
};

interface ProjectSectionProps {
  title?: string;
  extraText?: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const ProjectSection = ({
  title = '',
  extraText = '',
  header,
  children,
  isLoading = false,
}: ProjectSectionProps) => (
  <div className="gap-0 overflow-hidden border py-0">
    <div className="flex items-center justify-between border-b px-4 py-3">
      {header ? (
        header
      ) : (
        <>
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {title}
          </h2>
          <span className="text-xs text-muted-foreground">{extraText}</span>
        </>
      )}
    </div>

    <div className="flex flex-col divide-y divide-border p-0">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);
