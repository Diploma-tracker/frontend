import { useTranslation } from '@/shared/utils/i18n';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Kbd, KbdGroup } from '@repo/ui-kit/components/common/data-display/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';

import { setCommandPaletteOpen } from '../model/editor-model';

const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Top-bar trigger for the command palette. The palette itself is mounted once in
 * `BpmnEditor`, so this is only the (icon-only) button.
 */
export const BpmnSearch = reatomComponent(function BpmnSearch() {
  const { t } = useTranslation();
  const modifier = isApplePlatform() ? '⌘' : 'Ctrl';

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
          <KbdGroup>
            <Kbd>{modifier}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </TooltipContent>
    </Tooltip>
  );
});
