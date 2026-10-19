import { useTranslation } from '@/shared/utils/i18n';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Shortcut } from '@repo/ui-kit/components/common/data-display/shortcut';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';

import { setCommandPaletteOpen } from '../model/editor-model';

export const BpmnSearch = reatomComponent(function BpmnSearch() {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          intent="neutral"
          size="icon-sm"
          className="ui:size-8"
          aria-label={t('bpmnEditor.command.open')}
          onClick={() => setCommandPaletteOpen(true)}
        >
          <MagnifyingGlassIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="flex items-center gap-2">
          {t('bpmnEditor.command.open')}
          <Shortcut keys="Mod+K" />
        </span>
      </TooltipContent>
    </Tooltip>
  );
});
