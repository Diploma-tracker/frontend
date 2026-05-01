import { MultiSelect } from '@/shared/components';
import { useMultiSelect, useMultiSelectModalShows } from '@/shared/components/form/multi-select';
import { k, useTranslation } from '@/shared/utils/i18n';
import { CheckIcon, XIcon } from '@phosphor-icons/react';

import { LoginTokenUserRole } from '@repo/api/model';
import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { loadUserOptions, type UserOption } from '../../models/user-selector-model';
import { UserInfo } from '../user-info/user-info';

interface UserSelectorContentProps {
  role?: LoginTokenUserRole;
}

const ROLE_TO_ACTOR_NAME: Record<LoginTokenUserRole, string> = {
  [LoginTokenUserRole.admin]: k('user.roles.admin'),
  [LoginTokenUserRole.staff]: k('user.roles.staff'),
  [LoginTokenUserRole.student]: k('user.roles.student'),
};

function UserSelectorOption({ option }: { option: UserOption }) {
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
      {isSelected ? <CheckIcon className="size-4 text-primary" /> : <span className="size-4" />}
      <UserInfo userId={option.value} />
      {isSelected && (
        <span className="absolute right-2 flex size-4 items-center justify-center">
          <XIcon className="size-3.5 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}

export function UserSelectorContent({ role }: UserSelectorContentProps) {
  const { t } = useTranslation();
  const { showSelected, showSuggestions, showEmpty } = useMultiSelectModalShows();
  const actorName = role ? t(ROLE_TO_ACTOR_NAME[role]) : '';

  return (
    <>
      <MultiSelect.Trigger visibleChips={2} placeholder={t('user.selector.placeholder', { name: actorName })} />
      <MultiSelect.Modal>
        <MultiSelect.Search placeholder={t('user.selector.searchPlaceholder', { name: actorName })} />
        <div className="flex flex-col gap-1">
          {showSelected && (
            <>
              <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{t('user.selector.selected')}</p>
              <div className="scroll-py-1 overflow-y-auto p-1">
                <MultiSelect.SelectedOptions>
                  {(option) => <UserSelectorOption key={option.value} option={option} />}
                </MultiSelect.SelectedOptions>
              </div>
            </>
          )}
          {showSuggestions && (showSelected || showEmpty) && <Separator />}
          {showSuggestions && (
            <div className="scroll-py-1 overflow-y-auto p-1">
              <MultiSelect.Suggestions filter>
                {(option) => <UserSelectorOption key={option.value} option={option} />}
              </MultiSelect.Suggestions>
            </div>
          )}
        </div>
        <MultiSelect.Placeholders empty={t('user.selector.noResults')} placeholder={t('user.selector.startTyping')} />
      </MultiSelect.Modal>
    </>
  );
}

interface UserSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  handleChange: (options: UserOption[], prev: UserOption[]) => void;
  role?: LoginTokenUserRole;
}

export function UserSelector({ disabled, invalid, handleChange, role }: UserSelectorProps) {
  const loadOptions = (query: string) => loadUserOptions(query, role);

  return (
    <MultiSelect.Root
      onChange={handleChange}
      loadOptions={loadOptions}
      disabled={disabled}
      aria-invalid={invalid || undefined}
    >
      <UserSelectorContent role={role} />
    </MultiSelect.Root>
  );
}
