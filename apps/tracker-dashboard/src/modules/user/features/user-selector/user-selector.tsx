import React from 'react';
import { useEffectOnce } from 'react-use';

import type { Setter } from '@/shared/utils/types';
import { useDebounce } from '@/shared/utils/use-debounce';
import { UserIcon } from '@phosphor-icons/react';

import type { LoginTokenUserRole } from '@repo/api/model';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@repo/ui-kit/components/combobox';
import { InputGroupAddon } from '@repo/ui-kit/components/input-group';

import {
  type UserOption,
  loadUserOptions,
} from '../../models/user-selector-model';
import { userQuery } from '../../models/users-model';
import { UserInfo } from '../user-info/user-info';

function UserSelectorOption({
  option,
}: {
  option: UserOption;
  selected: boolean;
}) {
  return (
    <ComboboxItem value={option} className="flex items-center gap-3">
      <UserInfo userId={option.value} />
    </ComboboxItem>
  );
}

interface UserSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  role?: LoginTokenUserRole;
  value: string | null;
  setValue: Setter<string | null>;
}

export function UserSelector({
  disabled,
  invalid,
  role,
  value,
  setValue,
}: UserSelectorProps) {
  const [items, setItems] = React.useState<UserOption[] | null>(null);

  const [inputValue, setInputValue] = React.useState('');
  const [initial, setInitial] = React.useState<UserOption[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  useDebounce(async () => {
    if (inputValue.trim() === '') {
      setItems(null);
      return;
    }

    try {
      setLoading(true);

      const result = await loadUserOptions(inputValue, role);

      setItems(result);
    } finally {
      setLoading(false);
    }
  }, [inputValue]);

  useEffectOnce(() => {
    if (value) {
      (async () => {
        try {
          setLoading(true);

          const user = await userQuery(value).fetch();

          const label = `${user.firstName} ${user.lastName}`;
          setInitial([
            {
              value: user.id,
              label,
            },
          ]);
          setInputValue(label);
        } finally {
          setLoading(false);
        }
      })();
    }
  });

  const options = items ?? initial ?? [];

  return (
    <Combobox<UserOption>
      filteredItems={options}
      value={options.find((x) => x.value === value) ?? null}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onValueChange={(option) => {
        setValue(option?.value ?? null);
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringValue={(item) => item.label}
    >
      <ComboboxInput placeholder="Search user...">
        <InputGroupAddon>
          <UserIcon />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent>
        {!loading && options.length === 0 && (
          <ComboboxEmpty>No Users found.</ComboboxEmpty>
        )}

        <ComboboxList>
          {(option) => (
            <UserSelectorOption
              option={option}
              selected={option.value === value}
            />
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
