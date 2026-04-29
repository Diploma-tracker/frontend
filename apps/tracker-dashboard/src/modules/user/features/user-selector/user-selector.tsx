import { MultiSelect } from '@/shared/components';
import { useMultiSelectModalShows } from '@/shared/components/form/multi-select';
import { wrap } from '@reatom/core';

import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { loadUserOptions, type UserOption } from '../../models/user-selector-model';

export function UserSelectorContent() {
  const { showSelected, showSuggestions, showEmpty } = useMultiSelectModalShows();

  return (
    <>
      <MultiSelect.Trigger visibleChips={2} placeholder="Select user" />
      <MultiSelect.Modal>
        <MultiSelect.Search placeholder="Search User..." />
        <div className="flex flex-col gap-1">
          {showSelected && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Selected</p>
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
        <MultiSelect.Placeholders />
      </MultiSelect.Modal>
    </>
  );
}

interface UserSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  handleChange: (options: UserOption[], prev: UserOption[]) => void;
}

export function UserSelector({ disabled, invalid, handleChange }: UserSelectorProps) {
  return (
    <MultiSelect.Root
      onChange={handleChange}
      loadOptions={wrap(loadUserOptions)}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      <UserSelectorContent />
    </MultiSelect.Root>
  );
}
