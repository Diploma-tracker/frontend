import { useTranslation } from '@/shared/utils/i18n';
import { SlidersHorizontalIcon, XIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import { cn } from '@repo/ui-kit/lib/utils';

import { setPropertiesOpen } from '../model/editor-model';
import { BpmnInspector } from './bpmn-inspector';

/**
 * Floating properties panel shown over the canvas on the right. It is mounted
 * only while open — see `BpmnEditor` — and its body is contextual.
 */
export const BpmnProperties = reatomComponent(function BpmnProperties() {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full min-h-0 flex-col shadow-lg">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
        <CardTitle>{t('bpmnEditor.inspector.title')}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t('bpmnEditor.inspector.close')}
          title={t('bpmnEditor.inspector.close')}
          onClick={() => setPropertiesOpen(false)}
        >
          <XIcon className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <BpmnInspector />
      </CardContent>
    </Card>
  );
});

interface BpmnPropertiesPillProps {
  className: string;
}

/**
 * Collapsed handle pinned to the right edge. Rendered only while the panel is
 * closed, so there is always a way to bring it back.
 */
export const BpmnPropertiesPill = reatomComponent(function BpmnPropertiesPill({
  className,
}: BpmnPropertiesPillProps) {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="solid"
          intent="neutral"
          size="icon-sm"
          className={cn('rounded-full shadow-lg', className)}
          aria-label={t('bpmnEditor.topbar.showProperties')}
          onClick={() => setPropertiesOpen(true)}
        >
          <SlidersHorizontalIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        {t('bpmnEditor.topbar.showProperties')}
      </TooltipContent>
    </Tooltip>
  );
});
