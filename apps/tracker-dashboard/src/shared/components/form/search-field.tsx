import { type ComponentProps } from 'react';

import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui-kit/components/input-group';

interface SearchFieldProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchField = ({
  value,
  onChange,
  onClear,
  ...inputProps
}: SearchFieldProps) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <InputGroup className="w-64">
      <InputGroupAddon align="inline-start">
        <MagnifyingGlassIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleClear}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};
