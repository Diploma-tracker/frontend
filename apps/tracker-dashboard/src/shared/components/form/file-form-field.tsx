import React from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { UploadSimpleIcon } from '@phosphor-icons/react';
import type { FieldAtom } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@repo/ui-kit/components/common/form/field';

interface FileInputFieldProps {
  label: string;
  description?: string;
  accept?: string;
  field: FieldAtom<File | null>;
}

export const FileInputField = reatomComponent(function FileInputField({
  label,
  description,
  accept,
  field,
}: FileInputFieldProps) {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const value = field.value();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.change(e.target.files?.[0] ?? null);
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5"
          onClick={() => inputRef.current?.click()}
        >
          <UploadSimpleIcon size={14} />
          {value ? value.name : t('common.fileInput.chooseFile')}
        </Button>
        {value && (
          <span className="max-w-[140px] truncate text-xs text-muted-foreground">
            {value.name}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
});
