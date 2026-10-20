import { DeclarativeForm } from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { FilesIcon } from '@phosphor-icons/react';
import { reatomComponent, useAtom } from '@reatom/react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';

import { builderOutput, previewDataAtom } from '../../models/builder-state';

interface FormBuilderPreviewProps {
  onSubmit?: (data: Record<string, unknown>) => void;
}

/**
 * Live preview of the form being built. Pulls the JSON Schema + uiSchema pair
 * from the builder state and hands them, with the draft data, to the shared
 * {@link DeclarativeForm}; all rendering and validation lives there.
 */
export const FormBuilderPreview = reatomComponent(function FormBuilderPreview({
  onSubmit,
}: FormBuilderPreviewProps) {
  const { t } = useTranslation();
  const [data, setData] = useAtom(previewDataAtom);
  const { schema, uischema } = builderOutput();

  return (
    <DeclarativeForm
      className="max-w-2xl"
      schema={schema}
      uischema={uischema}
      data={data}
      onChange={setData}
      onSubmit={onSubmit}
      submitLabel={t('formBuilder.preview.submit')}
      crossFieldErrorLabel={t('formBuilder.preview.crossFieldError')}
      emptyState={
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <FilesIcon />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('formBuilder.preview.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('formBuilder.preview.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      }
    />
  );
});
