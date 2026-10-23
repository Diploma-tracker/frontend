import { type DragEvent, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import type { ControlProps, LayoutProps } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { FileArrowUpIcon, XIcon } from '@phosphor-icons/react';
import { format, parseISO } from 'date-fns';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';
import { DatePicker } from '@repo/ui-kit/components/common/form/date-picker';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { Textarea } from '@repo/ui-kit/components/common/form/textarea';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  matchesAcceptedFileMimeType,
  matchesAcceptedFileTypes,
} from './custom-ajv';

const requiredLabel = (label: string, required: boolean): string =>
  required ? `${label} *` : label;

const toDateValue = (data: unknown): Date | undefined => {
  if (typeof data !== 'string') {
    return undefined;
  }
  const parsed = parseISO(data);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

export const UiKitTextControl = withJsonFormsControlProps(function TextControl(
  props: ControlProps,
) {
  const { data, handleChange, path, enabled } = props;

  return (
    <Field
      orientation="vertical"
      data-invalid={props.errors ? true : undefined}
    >
      <FieldLabel>
        {requiredLabel(props.label, props.required ?? false)}
      </FieldLabel>
      <Input
        type="text"
        aria-label={props.label || ''}
        aria-invalid={props.errors ? true : undefined}
        disabled={!enabled}
        placeholder={props.uischema.options?.placeholder}
        value={typeof data === 'string' ? data : ''}
        onChange={(event) => handleChange(path, event.target.value)}
      />
      {props.errors ? <FieldError>{props.errors}</FieldError> : null}
    </Field>
  );
});

export const UiKitTextareaControl = withJsonFormsControlProps(
  function TextareaControl(props: ControlProps) {
    const { data, handleChange, path, enabled } = props;

    return (
      <Field
        orientation="vertical"
        data-invalid={props.errors ? true : undefined}
      >
        <FieldLabel>
          {requiredLabel(props.label, props.required ?? false)}
        </FieldLabel>
        <Textarea
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          disabled={!enabled}
          placeholder={props.uischema.options?.placeholder}
          value={typeof data === 'string' ? data : ''}
          onChange={(event) => handleChange(path, event.target.value)}
        />
        {props.errors ? <FieldError>{props.errors}</FieldError> : null}
      </Field>
    );
  },
);

export const UiKitNumberControl = withJsonFormsControlProps(
  function NumberControl(props: ControlProps) {
    const { data, handleChange, path, enabled } = props;

    return (
      <Field
        orientation="vertical"
        data-invalid={props.errors ? true : undefined}
      >
        <FieldLabel>
          {requiredLabel(props.label, props.required ?? false)}
        </FieldLabel>
        <Input
          type="number"
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          disabled={!enabled}
          placeholder={props.uischema.options?.placeholder}
          step="any"
          value={typeof data === 'number' ? data : ''}
          onChange={(event) => {
            const raw = event.target.value;
            handleChange(path, raw === '' ? undefined : Number(raw));
          }}
        />
        {props.errors ? <FieldError>{props.errors}</FieldError> : null}
      </Field>
    );
  },
);

export const UiKitIntegerControl = withJsonFormsControlProps(
  function IntegerControl(props: ControlProps) {
    const { data, handleChange, path, enabled } = props;

    return (
      <Field
        orientation="vertical"
        data-invalid={props.errors ? true : undefined}
      >
        <FieldLabel>
          {requiredLabel(props.label, props.required ?? false)}
        </FieldLabel>
        <Input
          type="number"
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          disabled={!enabled}
          placeholder={props.uischema.options?.placeholder}
          step="1"
          value={typeof data === 'number' ? data : ''}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              handleChange(path, undefined);
              return;
            }
            const num = Number(raw);
            if (Number.isInteger(num)) {
              handleChange(path, num);
            }
          }}
        />
        {props.errors ? <FieldError>{props.errors}</FieldError> : null}
      </Field>
    );
  },
);

export const UiKitBooleanControl = withJsonFormsControlProps(
  function BooleanControl(props: ControlProps) {
    const { data, handleChange, path, enabled, id } = props;

    return (
      <Field
        orientation="horizontal"
        data-invalid={props.errors ? true : undefined}
      >
        <Checkbox
          id={id}
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          disabled={!enabled}
          checked={data === true}
          onCheckedChange={(checked) => handleChange(path, checked === true)}
        />
        <FieldContent>
          <FieldLabel htmlFor={id}>
            {requiredLabel(props.label, props.required ?? false)}
          </FieldLabel>
          {props.errors ? <FieldError>{props.errors}</FieldError> : null}
        </FieldContent>
      </Field>
    );
  },
);

export const UiKitEnumControl = withJsonFormsControlProps(function EnumControl(
  props: ControlProps,
) {
  const { data, handleChange, path, enabled, schema } = props;

  const enumValues = Array.isArray(schema.enum)
    ? (schema.enum as unknown[])
        .map((value) => String(value))
        .filter((value) => value.length > 0)
    : [];

  const selected =
    typeof data === 'string' && data.length > 0 ? data : undefined;

  return (
    <Field
      orientation="vertical"
      data-invalid={props.errors ? true : undefined}
    >
      <FieldLabel>
        {requiredLabel(props.label, props.required ?? false)}
      </FieldLabel>
      <Select
        value={selected}
        disabled={!enabled}
        onValueChange={(value) => handleChange(path, value)}
      >
        <SelectTrigger
          className="ui:w-full"
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
        >
          <SelectValue placeholder={props.uischema.options?.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {enumValues.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {props.errors ? <FieldError>{props.errors}</FieldError> : null}
    </Field>
  );
});

export const UiKitDateControl = withJsonFormsControlProps(function DateControl(
  props: ControlProps,
) {
  const { data, handleChange, path, enabled } = props;

  return (
    <Field
      orientation="vertical"
      data-invalid={props.errors ? true : undefined}
    >
      <FieldLabel>
        {requiredLabel(props.label, props.required ?? false)}
      </FieldLabel>
      <DatePicker
        aria-label={props.label || ''}
        aria-invalid={props.errors ? true : undefined}
        disabled={!enabled}
        placeholder={props.uischema.options?.placeholder}
        value={toDateValue(data)}
        onChange={(nextDate) =>
          handleChange(
            path,
            nextDate ? format(nextDate, 'yyyy-MM-dd') : undefined,
          )
        }
      />
      {props.errors ? <FieldError>{props.errors}</FieldError> : null}
    </Field>
  );
});

export const UiKitFileControl = withJsonFormsControlProps(function FileControl(
  props: ControlProps,
) {
  const { data, handleChange, path, enabled, id, schema } = props;
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragStatus, setDragStatus] = useState<'idle' | 'valid' | 'invalid'>(
    'idle',
  );
  const [hasRejectedFile, setHasRejectedFile] = useState(false);

  const fileName = typeof data === 'string' && data.length > 0 ? data : null;

  const fileTypes = useMemo(() => {
    const raw = (schema as Record<string, unknown>)['x-file-types'];
    return Array.isArray(raw)
      ? raw.filter((v): v is string => typeof v === 'string')
      : [];
  }, [schema]);

  const accept = useMemo(
    () =>
      fileTypes
        .map((type) => {
          const normalized = type.trim();
          if (normalized.includes('/')) return normalized;
          return normalized.startsWith('.') ? normalized : `.${normalized}`;
        })
        .join(','),
    [fileTypes],
  );

  const selectFile = (file: File | undefined) => {
    if (!file) {
      handleChange(path, undefined);
      setHasRejectedFile(false);
      return;
    }

    if (
      fileTypes.length > 0 &&
      !matchesAcceptedFileTypes(fileTypes, file.name)
    ) {
      setHasRejectedFile(true);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setHasRejectedFile(false);
    handleChange(path, file.name);
  };

  const fileFromTransfer = (transfer: DataTransfer): File | undefined =>
    transfer.files[0] ??
    Array.from(transfer.items)
      .map((item) => item.getAsFile())
      .find((file): file is File => file !== null);

  const isTransferFileAllowed = (
    transfer: DataTransfer,
  ): boolean | undefined => {
    if (fileTypes.length === 0) return true;

    const file = fileFromTransfer(transfer);
    if (file) return matchesAcceptedFileTypes(fileTypes, file.name);

    const fileItem = Array.from(transfer.items).find(
      (item) => item.kind === 'file',
    );
    if (!fileItem) return undefined;

    return matchesAcceptedFileMimeType(fileTypes, fileItem.type);
  };

  const updateDragStatus = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!enabled) return;

    const isAllowed = isTransferFileAllowed(event.dataTransfer) ?? true;

    setDragStatus(isAllowed ? 'valid' : 'invalid');
    event.dataTransfer.dropEffect = isAllowed ? 'copy' : 'none';
  };

  return (
    <Field
      orientation="vertical"
      data-invalid={props.errors ? true : undefined}
    >
      <FieldLabel>
        {requiredLabel(props.label, props.required ?? false)}
      </FieldLabel>
      <div
        className={cn(
          'flex min-h-24 items-stretch rounded-lg border border-dashed transition-colors',
          dragStatus === 'valid' && 'border-primary bg-primary/5',
          dragStatus === 'invalid' && 'border-destructive bg-destructive/5',
          dragStatus === 'idle' && 'border-input bg-muted/20',
          props.errors && 'border-destructive',
          !enabled && 'cursor-not-allowed opacity-50',
        )}
        onDragEnter={updateDragStatus}
        onDragOver={updateDragStatus}
        onDragLeave={(event) => {
          const nextTarget = event.relatedTarget;
          if (
            !(nextTarget instanceof Node) ||
            !event.currentTarget.contains(nextTarget)
          ) {
            setDragStatus('idle');
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragStatus('idle');
          if (!enabled) return;
          selectFile(fileFromTransfer(event.dataTransfer));
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          className="hidden"
          disabled={!enabled}
          accept={accept || undefined}
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
          }}
        />
        <button
          type="button"
          disabled={!enabled}
          aria-label={fileName ?? t('formBuilder.preview.dropFile')}
          aria-invalid={props.errors ? true : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed"
          onClick={() => inputRef.current?.click()}
        >
          <FileArrowUpIcon className="size-6 shrink-0 text-muted-foreground" />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-medium">
              {fileName ?? t('formBuilder.preview.dropFile')}
            </span>
            {fileTypes.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t('formBuilder.preview.acceptedFileTypes', {
                  types: fileTypes.join(', '),
                })}
              </span>
            ) : !fileName ? (
              <span className="text-xs text-muted-foreground">
                {t('formBuilder.preview.chooseFile')}
              </span>
            ) : null}
          </span>
        </button>
        {fileName ? (
          <Button
            type="button"
            aria-label={t('formBuilder.preview.clearFile')}
            variant="ghost"
            size="icon-sm"
            disabled={!enabled}
            className="my-auto mr-2 shrink-0"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              setHasRejectedFile(false);
              handleChange(path, undefined);
            }}
          >
            <XIcon className="size-4" />
          </Button>
        ) : null}
      </div>
      {props.errors ? <FieldError>{props.errors}</FieldError> : null}
      {hasRejectedFile ? (
        <FieldError>
          {t('formBuilder.preview.invalidFileTypes', {
            types: fileTypes.join(', '),
          })}
        </FieldError>
      ) : null}
    </Field>
  );
});

export const UiKitVerticalLayout = withJsonFormsLayoutProps(
  function VerticalLayout(props: LayoutProps) {
    const { uischema, schema, path } = props;
    const elements =
      'elements' in uischema && Array.isArray(uischema.elements)
        ? uischema.elements
        : [];

    return (
      <div className="flex w-full flex-col gap-5">
        {elements.map((element, index) => (
          <JsonFormsDispatch
            key={index}
            uischema={element}
            schema={schema}
            path={path}
          />
        ))}
      </div>
    );
  },
);

export const UiKitHorizontalLayout = withJsonFormsLayoutProps(
  function HorizontalLayout(props: LayoutProps) {
    const { uischema, schema, path } = props;
    const elements =
      'elements' in uischema && Array.isArray(uischema.elements)
        ? uischema.elements
        : [];

    return (
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
        {elements.map((element, index) => (
          <div key={index} className="min-w-0 flex-1">
            <JsonFormsDispatch uischema={element} schema={schema} path={path} />
          </div>
        ))}
      </div>
    );
  },
);
