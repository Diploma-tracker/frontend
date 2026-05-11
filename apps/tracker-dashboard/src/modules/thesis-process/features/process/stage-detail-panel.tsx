import { k, useTranslation } from '@/shared/utils/i18n';
import { ClockIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import type { ThesisDataDTO } from '@repo/api';
import {
  Badge,
  type BadgeProps,
} from '@repo/ui-kit/components/common/data-display/badge';
import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import type { Stage } from '../../models/bachelor-thesis-process';
import {
  bachalorThesisProcessId,
  selectedStageDetail,
  thesisData,
} from '../../models/bachelor-thesis-process';
import { DefenseRegistrationPanel } from './stage-panels/defense-registration-panel';
import { DesignPanel } from './stage-panels/design-panel';
import { InitProcessPanel } from './stage-panels/init-process-panel';
import { InternshipPanel } from './stage-panels/internship-panel';
import { PlagiarismPanel } from './stage-panels/plagiarism-panel';
import { PreDefensePanel } from './stage-panels/pre-defense-panel';
import { ReviewPanel } from './stage-panels/review-panel';
import { ThesisDefensePanel } from './stage-panels/thesis-defense-panel';
import { TopicApprovalPanel } from './stage-panels/topic-approval-panel';

type StageStatus = Stage['status'];

interface StageConfig {
  title: string;
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  init_process: { title: 'Ініціалізація процесу' },
  topic_approval: { title: 'Узгодження теми' },
  design: { title: 'Етап проєктування' },
  internship: { title: 'Переддипломна практика' },
  plagiarism_check: { title: 'Перевірка на плагіат' },
  defense_registration: { title: 'Запис на захист' },
  pre_defense: { title: 'Передзахист' },
  review: { title: 'Рецензія проєкту' },
  thesis_defense: { title: 'Захист ДП' },
};

const statusLabel: Record<
  StageStatus,
  { label: string; intent: BadgeProps['intent'] }
> = {
  active: { label: k('active'), intent: 'primary' },
  completed: { label: k('completed'), intent: 'success' },
  waiting: { label: k('wating'), intent: 'pending' },
};

// ---------------------------------------------------------------------------
// Per-stage panel (always rendered; panels gate their own actions)
// ---------------------------------------------------------------------------

interface StagePanelProps {
  stageId: string;
  stage: Stage;
  state: string | null;
  processId: string;
  status: StageStatus;
  data: ThesisDataDTO | null;
}

function StagePanel({
  stageId,
  stage,
  state,
  processId,
  status,
  data,
}: StagePanelProps) {
  switch (stageId) {
    case 'init_process':
      return <InitProcessPanel processId={processId} stage={stage} />;
    case 'topic_approval':
      return (
        <TopicApprovalPanel
          processId={processId}
          status={status}
          state={state}
          data={data}
        />
      );
    case 'design':
      return (
        <DesignPanel
          processId={processId}
          status={status}
          state={state}
          data={data}
        />
      );
    case 'internship':
      return (
        <InternshipPanel
          processId={processId}
          status={status}
          state={state}
          data={data}
        />
      );
    case 'plagiarism_check':
      return (
        <PlagiarismPanel
          processId={processId}
          status={status}
          state={state}
          data={data}
        />
      );
    case 'pre_defense':
      return (
        <PreDefensePanel
          processId={processId}
          status={status}
          state={state}
          data={data}
        />
      );
    case 'review':
      return <ReviewPanel processId={processId} status={status} data={data} />;
    case 'defense_registration':
      return (
        <DefenseRegistrationPanel
          processId={processId}
          status={status}
          state={state}
        />
      );
    case 'thesis_defense':
      return (
        <ThesisDefensePanel processId={processId} status={status} data={data} />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const StageDetailPanel = reatomComponent(function StageDetailPanel() {
  const { t, formatDate } = useTranslation();
  const stage = selectedStageDetail();
  const processId = bachalorThesisProcessId();
  const thesis = thesisData();
  if (!thesis) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-sm">
        Не вдалося завантажити дані процесу
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-sm">
        Оберіть етап для перегляду деталей
      </div>
    );
  }

  const { data } = thesis;

  const config = STAGE_CONFIG[stage.id];
  const title = config?.title ?? stage.id;
  const statusInfo = statusLabel[stage.status] ?? statusLabel.waiting;
  const panel = (
    <StagePanel
      stageId={stage.id}
      stage={stage}
      state={stage.state}
      processId={processId}
      status={stage.status}
      data={data}
    />
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{t(title)}</h2>
          {stage.state && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {stage.state}
            </p>
          )}
        </div>
        <Badge variant="filled" intent={statusInfo.intent}>
          {statusInfo.label}
        </Badge>
      </div>

      <Separator />

      {/* Deadline */}
      <div className="px-5 py-4 text-sm">
        <p className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
          Дедлайн
        </p>
        <div className="flex items-center gap-1.5">
          <ClockIcon size={14} className="text-muted-foreground" />
          <span>
            {stage.deadline
              ? (formatDate(stage.deadline) ?? stage.deadline)
              : '—'}
          </span>
        </div>
      </div>

      {/* Stage panel — always rendered */}
      {panel && (
        <>
          <Separator />
          <div className="px-5 py-4">{panel}</div>
        </>
      )}
    </div>
  );
});
