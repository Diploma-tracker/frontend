import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';

import { StageList } from './stage-list';

/**
 * Properties for the diagram itself, shown when nothing is selected: the
 * ordered list of stages. A stage is a subprocess flagged with the `stage`
 * attribute; its order is stored in the diagram XML.
 */
export const GeneralInspector = reatomComponent(function GeneralInspector() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-sm font-medium">
          {t('bpmnEditor.inspector.stages')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('bpmnEditor.inspector.stagesHint')}
        </p>
        <StageList />
      </div>
    </ScrollArea>
  );
});
