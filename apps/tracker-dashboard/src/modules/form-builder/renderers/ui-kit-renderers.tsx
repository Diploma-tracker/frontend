import { useRef } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import type { ControlProps, LayoutProps } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { FileArrowUpIcon, XIcon } from '@phosphor-icons/react';
import { useAtom } from '@reatom/react';
import { format, parseISO } from 'date-fns';

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

import { previewMarkedFieldIdsAtom } from '../model/form-builder-model';

const markedFieldClass = 'rounded-md ring-2 ring-destructive/60 ring-offset-2';

const requiredLabel = (label: string, required: boolean): string =>
  required ? `${label} *` : label;

const useMarkedField = (path: string): boolean => {
  const [markedFields] = useAtom(previewMarkedFieldIdsAtom);
  return markedFields.includes(path);
};

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
      className={useMarkedField(path) ? markedFieldClass : undefined}
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
        className={useMarkedField(path) ? markedFieldClass : undefined}
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
        className={useMarkedField(path) ? markedFieldClass : undefined}
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

export const UiKitBooleanControl = withJsonFormsControlProps(
  function BooleanControl(props: ControlProps) {
    const { data, handleChange, path, enabled, id } = props;

    return (
      <Field
        orientation="horizontal"
        data-invalid={props.errors ? true : undefined}
        className={useMarkedField(path) ? markedFieldClass : undefined}
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
      className={useMarkedField(path) ? markedFieldClass : undefined}
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
      className={useMarkedField(path) ? markedFieldClass : undefined}
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
  const { data, handleChange, path, enabled, id } = props;
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const fileName = typeof data === 'string' && data.length > 0 ? data : null;

  return (
    <Field
      orientation="vertical"
      data-invalid={props.errors ? true : undefined}
      className={useMarkedField(path) ? markedFieldClass : undefined}
    >
      <FieldLabel>
        {requiredLabel(props.label, props.required ?? false)}
      </FieldLabel>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          aria-label={props.label || ''}
          aria-invalid={props.errors ? true : undefined}
          className="hidden"
          disabled={!enabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            handleChange(path, file ? file.name : undefined);
          }}
        />
        <label
          htmlFor={id}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent',
            enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
          )}
        >
          <FileArrowUpIcon className="size-4 shrink-0" />
          <span className="max-w-40 truncate">
            {fileName ?? t('formBuilder.preview.chooseFile')}
          </span>
        </label>
        {fileName ? (
          <button
            type="button"
            aria-label={t('formBuilder.preview.clearFile')}
            disabled={!enabled}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.value = '';
              }
              handleChange(path, undefined);
            }}
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>
      {props.errors ? <FieldError>{props.errors}</FieldError> : null}
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
