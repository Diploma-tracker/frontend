import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { cn } from '@repo/ui-kit/lib/utils';

interface SelectEnumProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectEnum<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectEnumProps<T>) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-44', className)}>
        <SelectValue placeholder={placeholder ?? 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const enumToOptions = <K extends string, T extends Record<K, string>>(
  enumObj: T,
  labels: Record<K, string>,
  labelMapper: (label: string) => string = (label) => label,
): { value: K; label: string }[] => {
  return Object.entries(enumObj).map(({ 0: key }) => ({
    value: key as K,
    label: labelMapper(labels[key as K]),
  }));
};
