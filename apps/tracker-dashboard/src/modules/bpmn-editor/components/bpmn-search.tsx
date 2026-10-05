import { useMemo, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';
import type { Element } from 'bpmn-js/lib/model/Types';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui-kit/components/common/floating/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';

import { getServices } from '../model/diagram-api';
import { getModeler, revealElement } from '../model/editor-model';

interface SearchHit {
  id: string;
  type: string;
  name: string;
}

const collectNamedElements = (query: string): SearchHit[] => {
  const modeler = getModeler();

  if (!modeler || !query.trim()) return [];

  const { elementRegistry } = getServices(modeler);
  const needle = query.trim().toLowerCase();

  return elementRegistry
    .getAll()
    .filter(
      (element): element is Element =>
        element.type !== 'label' &&
        !!element.businessObject?.name &&
        element.businessObject.name.toLowerCase().includes(needle),
    )
    .slice(0, 8)
    .map((element) => ({
      id: element.id,
      type: element.type,
      name: element.businessObject.name as string,
    }));
};

/**
 * Element search, collapsed to a single icon button so the top bar stays on one
 * line. The input and its results live inside the popover.
 */
export const BpmnSearch = reatomComponent(function BpmnSearch() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const hits = useMemo(() => collectNamedElements(query), [query]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (!next) setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              intent="neutral"
              size="icon-sm"
              className="ui:size-8"
              aria-label={t('bpmnEditor.search.open')}
            >
              <MagnifyingGlassIcon className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('bpmnEditor.search.open')}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72 p-1">
        <div className="flex items-center gap-1.5 border-b px-2 pb-2">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            placeholder={t('bpmnEditor.search.placeholder')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') handleOpenChange(false);
            }}
          />
          {query.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t('bpmnEditor.search.clear')}
              onClick={() => setQuery('')}
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto pt-1">
          {hits.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              {t('bpmnEditor.search.empty')}
            </p>
          ) : (
            hits.map((hit) => (
              <button
                key={hit.id}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  revealElement(hit.id);
                  handleOpenChange(false);
                }}
              >
                <span className="truncate font-medium">{hit.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {hit.type}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
