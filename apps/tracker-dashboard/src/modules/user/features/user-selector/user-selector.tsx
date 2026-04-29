import { MultiSelect } from '@/shared/components';
import { useMultiSelectModalShows } from '@/shared/components/form/multi-select';

import { LoginTokenUserRole } from '@repo/api/model';
import { Separator } from '@repo/ui-kit/components/common/layout/separator';

import { loadUserOptions, type UserOption } from '../../models/user-selector-model';

interface UserSelectorContentProps {
  role?: LoginTokenUserRole;
}

export function UserSelectorContent({ role }: UserSelectorContentProps) {
  const { showSelected, showSuggestions, showEmpty } = useMultiSelectModalShows();

  const roleToActorName: Record<LoginTokenUserRole, string> = {
    [LoginTokenUserRole.admin]: 'Admin',
    [LoginTokenUserRole.staff]: 'Staff',
    [LoginTokenUserRole.student]: 'Student',
  };
  const actorName = role ? roleToActorName[role] : '';

  return (
    <>
      <MultiSelect.Trigger visibleChips={2} placeholder={`Select ${actorName}`} />
      <MultiSelect.Modal>
        <MultiSelect.Search placeholder={`Search ${actorName}...`} />
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
