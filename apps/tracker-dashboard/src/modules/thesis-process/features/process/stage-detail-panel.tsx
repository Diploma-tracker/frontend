import React from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { ClockIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import type { Stage } from '../../models/bachelor-thesis-process';
import {
  selectedStageDetail,
  thesisData,
} from '../../models/bachelor-thesis-process';
import { STAGE_LABELS, getStageStateLabel } from './constants';
import { StatusBadge } from './general';
import { DefenseRegistrationPanel } from './stage-panels/defense-registration-panel';
import { DesignPanel } from './stage-panels/design-panel';
import { InitProcessPanel } from './stage-panels/init-process-panel';
import { InternshipPanel } from './stage-panels/internship-panel';
import { PlagiarismPanel } from './stage-panels/plagiarism-panel';
import { PreDefensePanel } from './stage-panels/pre-defense-panel';
import { ReviewPanel } from './stage-panels/review-panel';
import { ThesisDefensePanel } from './stage-panels/thesis-defense-panel';
import { TopicApprovalPanel } from './stage-panels/topic-approval-panel';

// ---------------------------------------------------------------------------
// Per-stage panel (always rendered; panels gate their own actions)
// ---------------------------------------------------------------------------

interface StagePanelProps {
  stageId: string;
  stage: Stage;
}

const STAGE_PANELS: Record<string, React.ComponentType<{ stage: Stage }>> = {
  init_process: InitProcessPanel,
  topic_approval: TopicApprovalPanel,
  design: DesignPanel,
  internship: InternshipPanel,
  plagiarism_check: PlagiarismPanel,
  pre_defense: PreDefensePanel,
  review: ReviewPanel,
  defense_registration: DefenseRegistrationPanel,
  thesis_defense: ThesisDefensePanel,
};

function StagePanel({ stageId, stage }: StagePanelProps) {
  const PanelComponent = STAGE_PANELS[stageId] ?? null;
  if (!PanelComponent) return null;
  return <PanelComponent stage={stage} />;
}

interface StageDetailsContextValue {
  stage: Stage;
}
const stageDetailsContext =
  React.createContext<StageDetailsContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useStageDetailsContext = (): StageDetailsContextValue => {
  const context = React.useContext(stageDetailsContext);
  if (!context) {
    throw new Error(
      'useStageDetailsContext must be used within a StageDetailPanel',
    );
  }
  return context;
};

const StageDetailsProvider: React.FC<{
  stage: Stage;
  children: React.ReactNode;
}> = ({ stage, children }) => {
  return (
    <stageDetailsContext.Provider value={{ stage }}>
      {children}
    </stageDetailsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const StageDetailPanel = reatomComponent(function StageDetailPanel() {
  const { t, formatDate } = useTranslation();
  const stage = selectedStageDetail();
  const thesis = thesisData();
  if (!thesis) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-sm">
        {t('thesisProcess.panels.noProcess')}
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-sm">
        {t('thesisProcess.panels.noStage')}
      </div>
    );
  }

  const title = t(STAGE_LABELS[stage.id] ?? stage.id);
  const panel = <StagePanel stageId={stage.id} stage={stage} />;
  const state = getStageStateLabel(stage);

  return (
    <StageDetailsProvider stage={stage}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {state && (
              <p className="mt-0.5 text-sm text-muted-foreground">{t(state)}</p>
            )}
          </div>
          <StatusBadge status={stage.status} />
        </div>

        <Separator />

        {/* Deadline */}
        <div className="px-5 py-4 text-sm">
          <p className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
            {t('thesisProcess.panels.deadline')}
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
    </StageDetailsProvider>
  );
});
