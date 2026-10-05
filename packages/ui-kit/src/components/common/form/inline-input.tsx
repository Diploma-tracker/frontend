import * as React from 'react';

import { cn } from '../../../lib/utils';

/**
 * Text that turns into an input on click. Commit on blur or Enter, revert on
 * Escape.
 */
function InlineInput({
  className,
  value,
  placeholder,
  ...props
}: Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  onCommit?: (value: string) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = React.useState(value);
  const [editing, setEditing] = React.useState(false);

  // Follow the source value while not editing, so an external rename — undo, a
  // bpmndi update — still shows through.
  React.useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const cancel = () => {
    setDraft(value);
    setEditing(false);
    props.onCancel?.();
  };

  const commit = () => {
    const next = draft.trim();

    setEditing(false);

    if (next === value) return;

    setDraft(next);
    props.onValueChange(next);
    props.onCommit?.(next);
  };

  if (!editing) {
    return (
      <button
        type="button"
        data-slot="inline-input"
        className={cn(
          'ui:inline-flex ui:w-full ui:min-w-0 ui:items-center ui:rounded-md ui:border ui:border-transparent ui:bg-transparent ui:px-2 ui:py-1 ui:text-left ui:font-medium ui:transition-colors ui:hover:border-border ui:hover:bg-accent ui:focus-visible:border-ring ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50 ui:focus-visible:outline-none',
          className,
        )}
        onClick={() => setEditing(true)}
      >
        <span className="truncate">{value || placeholder}</span>
      </button>
    );
  }

  return (
    <input
      // Editing starts from a click on the element itself, so the caret belongs
      // where the user's attention already is.
      autoFocus
      data-slot="inline-input"
      className={cn(
        'ui:w-full ui:min-w-0 ui:rounded-md ui:border ui:border-ring ui:bg-background ui:px-2 ui:py-1 ui:font-medium ui:text-foreground ui:shadow-xs ui:transition-[color,box-shadow] ui:outline-none ui:selection:bg-primary ui:selection:text-primary-foreground ui:placeholder:text-muted-foreground',
        'ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50',
        className,
      )}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          // Blur is what commits, so Enter routes through the same path a click
          // away would take.
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          cancel();
        }
      }}
      {...props}
    />
  );
}

export { InlineInput };
