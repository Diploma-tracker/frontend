import { useEffect, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { CheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';

import {
  changeSelectedType,
  renameSelected,
  selectedElementAtom,
} from '../model/editor-model';
import { type PaletteElement, createEntries } from '../model/element-catalog';

const SWITCHABLE_GROUPS = createEntries.filter(
  ({ group }) => group.id !== 'container',
);

const NameField = reatomComponent(function NameField({
  elementId,
  value,
}: {
  elementId: string;
  value: string;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? value;

  // Re-sync when the selection changes, so a stale draft never leaks across
  // elements.
  useEffect(() => {
    setDraft(null);
  }, [elementId]);

  const commit = () => {
    const next = (draft ?? value).trim();

    if (draft !== null && next !== value) renameSelected(next);

    setDraft(null);
  };

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.name')}</FieldLabel>
      <div className="flex items-center gap-1.5">
        <Input
          value={name}
          placeholder={t('bpmnEditor.inspector.namePlaceholder')}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit();
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              setDraft(null);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={t('bpmnEditor.inspector.save')}
          title={t('bpmnEditor.inspector.save')}
          onClick={commit}
        >
          <CheckIcon className="size-3.5" />
        </Button>
      </div>
    </Field>
  );
});

const TypeSwitcher = reatomComponent(function TypeSwitcher({
  current,
  onSelect,
}: {
  current: string;
  onSelect: (element: PaletteElement) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {SWITCHABLE_GROUPS.map(({ group, elements }) => (
        <section key={group.id} className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t(group.labelKey)}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {elements.map((element) => {
              const Icon = element.icon;
              const active = element.bpmnType === current;

              return (
                <Button
                  key={element.id}
                  type="button"
                  variant={active ? 'solid' : 'outline'}
                  intent={active ? 'primary' : 'neutral'}
                  size="xs"
                  title={t(element.descriptionKey)}
                  onClick={() => onSelect(element)}
                >
                  <Icon className="size-3.5" />
                  {t(element.labelKey)}
                </Button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
});

/**
 * Body of the properties panel. Renders one of three states: nothing selected,
 * a connection selected (flows have a name but cannot change type), or a node
 * selected (name plus type switcher).
 */
export const BpmnInspector = reatomComponent(function BpmnInspector() {
  const { t } = useTranslation();
  const selected = selectedElementAtom();

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <PencilSimpleIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('bpmnEditor.inspector.empty')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <NameField elementId={selected.id} value={selected.name} />

        <div className="rounded-md border bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground">
            {t('bpmnEditor.inspector.currentType')}
          </div>
          <div className="mt-1 font-mono text-sm font-medium break-all">
            {selected.type}
          </div>
        </div>

        {selected.isConnection ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t('bpmnEditor.topbar.incomingFlows')}
              </span>
              <span className="font-medium">{selected.incomingCount}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t('bpmnEditor.topbar.outgoingFlows')}
              </span>
              <span className="font-medium">{selected.outgoingCount}</span>
            </div>
          </div>
        ) : (
          <TypeSwitcher
            current={selected.type}
            onSelect={(element) => changeSelectedType(element)}
          />
        )}
      </div>
    </ScrollArea>
  );
});
