/**
 * Shared primitives reused across all stage action panels.
 */
import React from 'react';

import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { bachelorThesisProcess } from '@repo/api';
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui-kit/components/common/floating/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui-kit/components/common/floating/dialog';

import {
  type Stage,
  ThesisRole,
  userRole,
} from '../../../models/bachelor-thesis-process';

// ---------------------------------------------------------------------------
// DataItem — shows a key/value pair from submitted thesis data
// ---------------------------------------------------------------------------
interface DataItemProps {
  label: string;
  value: React.ReactNode;
}

export function DataItem({ label, value }: DataItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileLink — fetches a presigned URL on click and opens in new tab
// ---------------------------------------------------------------------------
interface FileLinkProps {
  processId: string;
  fileId: string;
  label?: string;
}

export function FileLink({ processId, fileId, label }: FileLinkProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await wrap(
        bachelorThesisProcess.downloadBachelorThesisProcessFile(
          processId,
          fileId,
        ),
      );
      if (res.ok) {
        window.open(res.data.url, '_blank');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-primary underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? 'Завантаження...' : (label ?? 'Відкрити файл')}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SectionTitle
// ---------------------------------------------------------------------------
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// StageDescription — static read-only info block shown for all stage statuses
// ---------------------------------------------------------------------------
interface StageDescriptionProps {
  description: string;
  responsible?: string;
  /** Human-readable label for the current inner state */
  stateLabel?: string | null;
}

export function StageDescription({
  description,
  responsible,
  stateLabel,
}: StageDescriptionProps) {
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <p>{description}</p>
      {responsible && (
        <p className="text-xs">
          <span className="font-medium text-foreground">Відповідальний: </span>
          {responsible}
        </p>
      )}
      {stateLabel && (
        <p className="text-xs">
          <span className="font-medium text-foreground">Статус: </span>
          {stateLabel}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionButtons  (full-width button row)
// ---------------------------------------------------------------------------
interface ActionButtonsProps {
  children: React.ReactNode;
}

export function ActionButtons({ children }: ActionButtonsProps) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

// ---------------------------------------------------------------------------
// ConfirmationModal — wraps AlertDialog for simple confirm/cancel actions
// ---------------------------------------------------------------------------
interface ConfirmationModalProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmationModal({
  trigger,
  title,
  description,
  confirmLabel = 'Підтвердити',
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Скасувати</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// ActionDialog — wraps Dialog for actions that require form fields
// ---------------------------------------------------------------------------
interface ActionDialogProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  submitLabel?: string;
  canSubmit?: boolean;
  loading?: boolean;
  onSubmit: () => Promise<void> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ActionDialog({
  trigger,
  title,
  children,
  submitLabel = 'Підтвердити',
  canSubmit = true,
  loading = false,
  onSubmit,
  open,
  onOpenChange,
}: ActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">{children}</div>
        <DialogFooter>
          <Button size="sm" disabled={!canSubmit || loading} onClick={onSubmit}>
            {loading ? 'Зачекайте...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Action {
  name: string;
  isActive: (state: Stage['state'] | null) => boolean;
  role?: ThesisRole;
  component: React.ReactNode;
}

interface ActionsSectionProps {
  state: Stage['state'] | null;
  status?: Stage['status'];
  actions: Action[];
}

export const ActionsSection = reatomComponent(function ActionsSection({
  state,
  status,
  actions,
}: ActionsSectionProps) {
  const role = userRole();

  if (status !== undefined && status !== 'active') return null;

  const isRoleAllowed = (actionRole?: ThesisRole) => {
    if (!actionRole) return true; // No role restriction
    return actionRole === role;
  };

  const activeActions = actions.filter(
    (action) => action.isActive(state) && isRoleAllowed(action.role),
  );
  if (activeActions.length === 0) return null;

  return (
    <>
      <SectionTitle>Дії</SectionTitle>
      {activeActions.map((action) => action.component)}
    </>
  );
});
