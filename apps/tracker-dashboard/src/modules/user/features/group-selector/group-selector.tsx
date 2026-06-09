import React from 'react';
import { useEffectOnce } from 'react-use';

import type { Setter } from '@/shared/utils/types';
import { useDebounce } from '@/shared/utils/use-debounce';
import { UsersFourIcon } from '@phosphor-icons/react';

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
  type GroupOption,
  loadGroupOptions,
} from '../../models/group-selector-model';
import { groupQuery } from '../../models/groups-model';
import { GroupInfo } from '../group-info/group-info';

function GroupSelectorOption({
  option,
}: {
  option: GroupOption;
  selected: boolean;
}) {
  return (
    <ComboboxItem value={option} className="flex items-center gap-3">
      <GroupInfo groupId={option.value} />
    </ComboboxItem>
  );
}

interface GroupSelectorProps {
  disabled?: boolean;
  invalid?: boolean;
  value: string | null;
  setValue: Setter<string | null>;
}

export function GroupSelector({
  disabled,
  invalid,
  value,
  setValue,
}: GroupSelectorProps) {
  const [items, setItems] = React.useState<GroupOption[] | null>(null);

  const [inputValue, setInputValue] = React.useState('');
  const [initial, setInitial] = React.useState<GroupOption[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  useDebounce(async () => {
    if (inputValue.trim() === '') {
      setItems(null);
      return;
    }

    try {
      setLoading(true);

      const result = await loadGroupOptions(inputValue);

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

          const group = await groupQuery(value).fetch();

          const label = group.name;
          setInitial([
            {
              value: group.id,
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
    <Combobox<GroupOption>
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
      <ComboboxInput placeholder="Search group...">
        <InputGroupAddon>
          <UsersFourIcon />
        </InputGroupAddon>
      </ComboboxInput>

      <ComboboxContent>
        {!loading && options.length === 0 && (
          <ComboboxEmpty>No Groups found.</ComboboxEmpty>
        )}

        <ComboboxList>
          {(option) => (
            <GroupSelectorOption
              option={option}
              selected={option.value === value}
            />
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
