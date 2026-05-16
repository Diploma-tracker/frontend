import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Progress } from '@repo/ui-kit/components/common/states/progress';

import {
  activeStages,
  processProgress,
  thesisData,
} from '../../models/bachelor-thesis-process';
import { STAGE_LABELS } from './constants';
import { StatusBadge } from './general';

export const ThesisProcessHeader = reatomComponent(
  function ThesisProcessHeader() {
    const { t } = useTranslation();
    const data = thesisData();
    const {
      total,
      status,
      completed,
      percentage: progress,
    } = processProgress();

    const activeStageLabels = activeStages().map(
      (s) => STAGE_LABELS[s.id] ?? s.id,
    );

    if (!data) return null;
    const { topic } = data.data;
    const title = topic
      ? `${topic.uk} / ${topic.en}`
      : t('thesisProcess.header.defaultTitle');

    const renderActiveStages = () => {
      if (activeStageLabels.length === 0) {
        return (
          <span className="text-sm text-muted-foreground">
            {t('thesisProcess.header.noActiveStages')}
          </span>
        );
      }

      return (
        <>
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            {t('thesisProcess.header.currentStages')}
          </span>
          {activeStageLabels.map((label) => (
            <Badge key={label} variant="filled" intent="primary">
              {t(label)}
            </Badge>
          ))}
        </>
      );
    };

    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge status={status} />
            </div>
            <h1 className="mb-3 text-lg leading-snug font-semibold">{title}</h1>
          </div>
          <div className="min-w-[120px] shrink-0 text-right">
            <p className="mb-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
              {t('thesisProcess.header.progress')}
            </p>
            <p className="text-3xl font-bold">{progress}%</p>
            <Progress value={progress} className="mt-1 ml-auto w-28" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            {renderActiveStages()}
          </div>
          <span className="text-sm text-muted-foreground">
            {t('thesisProcess.header.stagesCompleted', { completed, total })}
          </span>
        </div>
      </div>
    );
  },
);
