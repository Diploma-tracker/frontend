import { useTranslation } from '@/shared/utils/i18n';
import { CaretRightIcon, ClockIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { cn } from '@repo/ui-kit/lib/utils';

import {
  type Stage,
  fetchBachalorThesisProcess,
  selectedStage,
} from '../../models/bachelor-thesis-process';
import { InfoDot, ProjectSection } from './general';

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

interface StageRowProps {
  stage: Stage;
}

const StageRow = reatomComponent(function StageRow({ stage }: StageRowProps) {
  const { t, formatDate } = useTranslation();
  const selected = selectedStage();
  const isSelected = selected === stage.id;
  const title = t(STAGE_CONFIG[stage.id]?.title ?? stage.id);

  const handleSelect = () => {
    selectedStage.set(stage.id);
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
        isSelected && 'bg-accent',
      )}
    >
      <InfoDot variant={stage.status} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              stage.status === 'waiting' && 'text-muted-foreground',
            )}
          >
            {title}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          {stage.deadline && (
            <span className="flex items-center gap-0.5">
              <ClockIcon size={10} />
              {formatDate(stage.deadline) ?? stage.deadline}
            </span>
          )}
        </div>
      </div>

      <CaretRightIcon size={14} className="shrink-0 text-muted-foreground" />
    </button>
  );
});

export const StagesPanel = reatomComponent(function StagesPanel() {
  const data = fetchBachalorThesisProcess.data();
  const status = fetchBachalorThesisProcess.status();

  return (
    <ProjectSection title="Stages" isLoading={status.isPending}>
      {data?.stages.map((stage) => (
        <StageRow key={stage.id} stage={stage} />
      ))}
    </ProjectSection>
  );
});
