import { MultiSelect } from '@/shared/components';
import {
  type Option,
  useMultiSelect,
  useMultiSelectModalShows,
} from '@/shared/components/form/multi-select';
import { useTranslation } from '@/shared/utils/i18n';
import type { Setter } from '@/shared/utils/types';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { loadGroupOptions } from '../../models/group-selector-model';
import { GroupInfo } from '../group-info/group-info';

function GroupSelectorOption({ option }: { option: Option }) {
  const { toggle, isOptionSelected } = useMultiSelect();
  const onClick = () => {
    toggle(option);
  };
  const isSelected = isOptionSelected(option.value);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
    >
      {isSelected ? (
        <CheckIcon className="size-4 text-primary" />
      ) : (
        <span className="size-4" />
      )}
      <GroupInfo groupId={option.value} />
      {isSelected && (
        <span className="absolute right-2 flex size-4 items-center justify-center">
          <XIcon className="size-3.5 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}

export function GroupSelectorContent() {
  const { t } = useTranslation();
  const { showSelected, showSuggestions, showEmpty } =
    useMultiSelectModalShows();

  return (
    <>
      <MultiSelect.Trigger
        visibleChips={2}
        placeholder={t('user.groupSelector.placeholder')}
      />
      <MultiSelect.Modal>
        <MultiSelect.Search
          placeholder={t('user.groupSelector.searchPlaceholder')}
        />
        <div className="flex flex-col gap-1">
          {showSelected && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {t('user.selector.selected')}
              </p>
              <div className="scroll-py-1 overflow-y-auto p-1">
                <MultiSelect.SelectedOptions>
                  {(option) => (
                    <GroupSelectorOption key={option.value} option={option} />
                  )}
                </MultiSelect.SelectedOptions>
              </div>
            </>
          )}
          {showSuggestions && (showSelected || showEmpty) && <Separator />}
          {showSuggestions && (
            <div className="scroll-py-1 overflow-y-auto p-1">
              <MultiSelect.Suggestions filter>
                {(option) => (
                  <GroupSelectorOption key={option.value} option={option} />
                )}
              </MultiSelect.Suggestions>
            </div>
          )}
        </div>
        <MultiSelect.Placeholders
          empty={t('user.selector.noResults')}
          placeholder={t('user.selector.startTyping')}
        />
      </MultiSelect.Modal>
    </>
  );
}

interface GroupSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  selected: Option[];
  setSelected: Setter<Option[]>;
}

export function GroupSelector({
  disabled,
  invalid,
  selected,
  setSelected,
}: GroupSelectorProps) {
  return (
    <MultiSelect.Root
      value={selected}
      setValue={setSelected}
      loadOptions={wrap(loadGroupOptions)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      <GroupSelectorContent />
    </MultiSelect.Root>
  );
}
