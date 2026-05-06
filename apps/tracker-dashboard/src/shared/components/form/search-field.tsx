import { type ComponentProps } from 'react';

import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui-kit/components/input-group';
import { cn } from '@repo/ui-kit/lib/utils';

interface SearchFieldProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchField = (props: SearchFieldProps) => {
  const { value, onChange, onClear, className, ...inputProps } = props;

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <InputGroup className={cn('w-64', className)}>
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
