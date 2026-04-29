import * as React from 'react';

import { useDebounce } from '@/shared/utils/use-debounce';
import { CheckIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import type { FieldArrayAtom } from '@reatom/core';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui-kit/components/common/floating/dialog';
import { cn } from '@repo/ui-kit/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MultiSelectOption {
  value: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type MultiSelectStatus = 'idle' | 'loading' | 'error' | 'disabled';

interface MultiSelectContextValue<TOption extends MultiSelectOption> {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (open: string) => void;
  status: MultiSelectStatus;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  selected: TOption[];
  avaliable: TOption[];
  filterOption: (option: TOption) => boolean;
  isOptionSelected: (value: string) => boolean;
  remove: (value: string) => void;
  add: (option: TOption) => void;
  toggle: (option: TOption) => void;
  clear: () => void;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MultiSelectContext = React.createContext<MultiSelectContextValue<any> | null>(null);
export function useMultiSelect<TOption extends MultiSelectOption>(): MultiSelectContextValue<TOption> {
  const ctx = React.useContext(MultiSelectContext);
  if (!ctx) throw new Error('MultiSelect compound parts must be used inside <MultiSelect.Root>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface MultiSelectRootProps<TOption extends MultiSelectOption> {
  onChange: (value: TOption[], prev: TOption[]) => void;
  loadOptions: (query: string) => Promise<TOption[]>;
  filterOption?: (option: TOption, query: string) => boolean;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
  children: React.ReactNode;
}

const defaultFilterOption = <TOption extends MultiSelectOption>(option: TOption, query: string) => {
  const label = option.label || option.value;
  return label.toLowerCase().includes(query.toLowerCase());
};

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectRoot<TOption extends MultiSelectOption = MultiSelectOption>({
  onChange,
  loadOptions,
  filterOption = defaultFilterOption<TOption>,
  disabled,
  'aria-invalid': ariaInvalid,
  children,
}: MultiSelectRootProps<TOption>) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelecte] = React.useState<TOption[]>([]);
  const [avaliable, setAvaliable] = React.useState<TOption[]>([]);
  const [query, setQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const initialStatus = disabled ? 'disabled' : 'idle';
  const [status, setStatus] = React.useState<MultiSelectStatus>(initialStatus);

  const wrappedLoadOptions = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed === '') {
      setAvaliable([]);
      setStatus('idle');
      return [];
    }

    setStatus('loading');
    try {
      const options = await loadOptions(trimmed);
      setAvaliable(options);
      setStatus('idle');
      return options;
    } catch {
      setStatus('error');
    }
    return [];
  };

  const prevSelectedRef = React.useRef(selected);

  // Notify parent when selection changes
  React.useEffect(() => {
    onChange(selected, prevSelectedRef.current);
    prevSelectedRef.current = selected;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Sync disabled state with status
  React.useEffect(() => {
    if (disabled) {
      setStatus('disabled');
    } else if (status === 'disabled') {
      setStatus('idle');
    }
  }, [disabled, status]);

  // Load options when the query changes, with debounce
  useDebounce(async () => {
    await wrappedLoadOptions(query);
  }, [query]);

  // Focus the search input when the modal opens
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const remove = (value: string) => setSelecte((options) => options.filter((o) => o.value !== value));

  const add = (option: TOption) => setSelecte((options) => [...options, option]);

  const toggle = (option: TOption) => {
    setSelecte((options) => {
      const value = option.value;
      const isSelected = options.some((o) => o.value === value);
      if (isSelected) {
        return options.filter((o) => o.value !== value);
      }
      return [...options, option];
    });
  };

  const isOptionSelected = (value: string) => selected.some((o) => o.value === value);

  const wrappedFilterOption = (option: TOption) => filterOption(option, query);

  const api = {
    open,
    setOpen,
    query,
    setQuery,
    status,
    selected,
    avaliable,
    searchInputRef,
    loadOptions: wrappedLoadOptions,
    filterOption: wrappedFilterOption,
    isOptionSelected,
    remove,
    add,
    toggle,
    clear: () => setSelecte([]),
    disabled,
    'aria-invalid': ariaInvalid,
  };

  return <MultiSelectContext.Provider value={api}>{children}</MultiSelectContext.Provider>;
}

// ---------------------------------------------------------------------------
// Chip — a single removable tag shown in the trigger
// ---------------------------------------------------------------------------

export interface MultiSelectChipProps {
  label: string;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectChip<TOption extends MultiSelectOption>({ option }: { option: TOption }) {
  const { remove, status } = useMultiSelect();
  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    remove(option.value);
  };
  const label = option.label || option.value;

  return (
    <span className="flex h-[calc(1.375rem)] items-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        disabled={status === 'disabled'}
        className="opacity-50 hover:opacity-100"
        aria-label={`Remove ${label}`}
      >
        <XIcon className="pointer-events-none size-3" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SelectOption — a single row in the dropdown list
// ---------------------------------------------------------------------------

export interface MultiSelectOptionItemProps<TOption extends MultiSelectOption> {
  option: TOption;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectOptionItem<TOption extends MultiSelectOption>({ option }: MultiSelectOptionItemProps<TOption>) {
  const { toggle, isOptionSelected } = useMultiSelect();
  const onClick = () => {
    toggle(option);
  };
  const label = option.label || option.value;
  const isSelected = isOptionSelected(option.value);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
    >
      {isSelected ? <CheckIcon className="size-4 text-primary" /> : <span className="size-4" />}
      {label}
      {isSelected && (
        <span className="absolute right-2 flex size-4 items-center justify-center">
          <XIcon className="size-3.5 text-muted-foreground" />
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface MultiSelectTriggerProps<TOption extends MultiSelectOption> {
  visibleChips?: number;
  placeholder?: string;
  className?: string;
  children?: (option: TOption) => React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectTrigger<TOption extends MultiSelectOption>({
  visibleChips = 3,
  placeholder = 'Select...',
  className,
  children = (option) => <MultiSelectChip option={option} />,
}: MultiSelectTriggerProps<TOption>) {
  const { selected, setOpen, status, 'aria-invalid': ariaInvalid } = useMultiSelect<TOption>();

  const visibleOptions = selected.slice(0, visibleChips);
  const hiddenCount = selected.length - visibleOptions.length;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  const renderRest = () => {
    if (hiddenCount <= 0) return null;
    return (
      <Badge variant="secondary" className="h-[calc(1.375rem)] text-xs">
        +{hiddenCount}
      </Badge>
    );
  };

  return (
    <button
      type="button"
      disabled={status === 'disabled'}
      onClick={() => setOpen(true)}
      aria-invalid={isInvalid || undefined}
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isInvalid && 'border-destructive ring-[3px] ring-destructive/20',
        className
      )}
    >
      {selected.length === 0 ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : (
        <>
          {visibleOptions.map(children)}
          {renderRest()}
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
interface MultiSelectSearchProps {
  placeholder?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectSearch({ placeholder = 'Search...' }: MultiSelectSearchProps) {
  const { status, query, setQuery, searchInputRef } = useMultiSelect();

  return (
    <div className="flex items-center gap-2 border-b px-3">
      <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={searchInputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      {status === 'loading' && (
        <div className="size-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      )}
    </div>
  );
}

export const useMultiSelectModalShows = () => {
  const { selected, avaliable, query, status } = useMultiSelect();

  const showSelected = selected.length > 0;
  const showSuggestions = status !== 'loading' && avaliable.length > 0;
  const showEmpty = (() => {
    if (status === 'loading') return false;
    if (query.trim() === '') return false;
    if (avaliable.length > 0) return false;
    return true;
  })();

  const showPlaceholder = !showSelected && !showSuggestions && !showEmpty;
  return {
    showSelected,
    showSuggestions,
    showEmpty,
    showPlaceholder,
  };
};

export interface MultiSelectModalProps {
  title?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectModalPlaceholders({
  empty = 'No results found.',
  placeholder = 'Start typing to see suggestions.',
}: {
  empty?: string;
  placeholder?: string;
}) {
  const { showEmpty, showPlaceholder } = useMultiSelectModalShows();

  if (showEmpty || showPlaceholder) {
    return (
      <p className="relative flex h-full flex-1 items-center justify-center text-center text-sm text-muted-foreground">
        {showPlaceholder && placeholder}
        {showEmpty && empty}
      </p>
    );
  }
  return null;
}

interface MultiSelectModalOptionsProps<TOption extends MultiSelectOption> {
  filter?: boolean;
  children?: (option: TOption) => React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectModalSuggestions<TOptoin extends MultiSelectOption>({
  filter = false,
  children = (option) => <MultiSelectOptionItem key={option.value} option={option} />,
}: MultiSelectModalOptionsProps<TOptoin>) {
  const { avaliable, selected } = useMultiSelect<TOptoin>();
  const { showSuggestions } = useMultiSelectModalShows();
  if (!showSuggestions) return null;

  const filterOption = (option: TOptoin) => {
    // Exclude already selected options
    if (selected.some((o) => o.value === option.value)) {
      return false;
    }
    return true;
  };

  const filterFunc = filter ? filterOption : () => true;

  return avaliable.filter(filterFunc).map(children);
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectModalSelected<TOptoin extends MultiSelectOption>({
  filter = false,
  children = (option) => <MultiSelectOptionItem key={option.value} option={option} />,
}: MultiSelectModalOptionsProps<TOptoin>) {
  const { selected, filterOption } = useMultiSelect<TOptoin>();
  const { showSelected } = useMultiSelectModalShows();
  if (!showSelected) return null;

  const filterFunc = filter ? filterOption : () => true;

  return selected.filter(filterFunc).map(children);
}

// eslint-disable-next-line react-refresh/only-export-components
function MultiSelectModal({ title = 'Select', children }: MultiSelectModalProps) {
  const { open, setOpen } = useMultiSelect();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="flex max-h-96 min-h-80 flex-col gap-1 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const MultiSelect = {
  Root: MultiSelectRoot,
  Trigger: MultiSelectTrigger,
  Modal: MultiSelectModal,
  Chip: MultiSelectChip,
  Option: MultiSelectOptionItem,
  SelectedOptions: MultiSelectModalSelected,
  Suggestions: MultiSelectModalSuggestions,
  Search: MultiSelectSearch,
  Placeholders: MultiSelectModalPlaceholders,
};

export const useSyncArrayFieldWithMultiSelect =
  <TOption extends MultiSelectOption>(field: FieldArrayAtom<string, string>) =>
  (next: TOption[]) => {
    const nodes = field?.array() ?? [];
    if (!field) return;

    const current = nodes.map((node) => node());
    const values = next.map((option) => option.value);

    // Remove deselected: find nodes whose value is no longer in `next`
    for (const node of nodes) {
      if (!values.includes(node())) {
        field.remove(node);
      }
    }

    // Add newly selected: values in `next` not yet in current
    for (const { value } of next) {
      if (!current.includes(value)) {
        field.create(value);
      }
    }
  };
