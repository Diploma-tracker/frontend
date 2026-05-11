import { ClockIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Progress } from '@repo/ui-kit/components/common/states/progress';

import {
  fetchBachalorThesisProcess,
  selectedStage,
} from '../../models/bachelor-thesis-process';

const STAGE_LABELS: Record<string, string> = {
  topic_approval: 'Узгодження теми',
  design: 'Проєктування',
  internship: 'Переддипломна практика',
  plagiarism_check: 'Перевірка на плагіат',
  defense_registration: 'Запис на захист',
  pre_defense: 'Передзахист',
  review: 'Рецензія',
  thesis_defense: 'Захист ДП',
};

export const ThesisProcessHeader = reatomComponent(
  function ThesisProcessHeader() {
    const process = fetchBachalorThesisProcess.data();
    const activeStageId = selectedStage();

    const stages = process?.stages ?? [];
    const total = stages.length;
    const completed = stages.filter((s) => s.status === 'completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const activeStage = stages.find((s) => s.id === activeStageId);
    const activeLabel = activeStageId
      ? (STAGE_LABELS[activeStageId] ?? activeStageId)
      : '—';
    const deadline = activeStage?.deadline ?? null;

    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="filled" intent="pending">
                В роботі
              </Badge>
            </div>
            <h1 className="mb-3 text-lg leading-snug font-semibold">
              Дипломний проєкт
            </h1>
          </div>

          <div className="min-w-[120px] shrink-0 text-right">
            <p className="mb-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
              Прогрес
            </p>
            <p className="text-3xl font-bold">{progress}%</p>
            <Progress value={progress} className="mt-1 ml-auto w-28" />
            {deadline && (
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <ClockIcon size={12} />
                Дедлайн: {deadline}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Поточний етап:
            </span>
            <Badge variant="filled" intent="pending">
              {activeLabel}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {completed} / {total} етапів завершено
          </span>
        </div>
      </div>
    );
  },
);
