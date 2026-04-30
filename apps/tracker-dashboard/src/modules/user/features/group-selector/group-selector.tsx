import { MultiSelect } from '@/shared/components';
import { useMultiSelectModalShows } from '@/shared/components/form/multi-select';
import { useTranslation } from '@/shared/utils/i18n';
import { wrap } from '@reatom/core';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { loadGroupOptions, type GroupOption } from '../../models/group-selector-model';

export function GroupSelectorContent() {
  const { t } = useTranslation();
  const { showSelected, showSuggestions, showEmpty } = useMultiSelectModalShows();

  return (
    <>
      <MultiSelect.Trigger visibleChips={2} placeholder={t('user.groupSelector.placeholder')} />
      <MultiSelect.Modal>
        <MultiSelect.Search placeholder={t('user.groupSelector.searchPlaceholder')} />
        <div className="flex flex-col gap-1">
          {showSelected && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{t('user.selector.selected')}</p>
              <div className="scroll-py-1 overflow-y-auto p-1">
                <MultiSelect.SelectedOptions />
              </div>
            </>
          )}
          {showSuggestions && (showSelected || showEmpty) && <Separator />}
          {showSuggestions && (
            <div className="scroll-py-1 overflow-y-auto p-1">
              <MultiSelect.Suggestions filter />
            </div>
          )}
        </div>
        <MultiSelect.Placeholders empty={t('user.selector.noResults')} placeholder={t('user.selector.startTyping')} />
      </MultiSelect.Modal>
    </>
  );
}

interface GroupSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  handleChange: (options: GroupOption[], prev: GroupOption[]) => void;
}

export function GroupSelector({ disabled, invalid, handleChange }: GroupSelectorProps) {
  return (
    <MultiSelect.Root
      onChange={handleChange}
      loadOptions={wrap(loadGroupOptions)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      <GroupSelectorContent />
    </MultiSelect.Root>
  );
}
