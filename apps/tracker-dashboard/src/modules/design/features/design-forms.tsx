import {
  FormBuilder,
  FormBuilderPreview,
  generateFormFromDomain,
} from '@/modules/forms';
import { FormPreview } from '@/shared/components/json-forms';
import { useTranslation } from '@/shared/utils/i18n';
import { FloppyDiskIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { Input } from '@repo/ui-kit/components/common/form/input';

import { setActiveTab } from '../models/design-model';
import {
  closeFormDraft,
  createFormDraft,
  filteredFormsAtom,
  formSearchAtom,
  openFormDraft,
  saveFormDraft,
  selectedFormIdAtom,
} from '../models/form-drafts';

interface DesignFormsProps {
  path: string[];
}

export const DesignForms = reatomComponent(function DesignForms({
  path,
}: DesignFormsProps) {
  const selectedId = selectedFormIdAtom();
  const section = path[0] ?? 'search';
  const mode = path[1] ?? 'build';

  if (selectedId && section === 'builder') {
    return <FormDraftEditor mode={mode} />;
  }

  return <FormDraftList />;
});

interface FormDraftEditorProps {
  mode: string;
}

const FormDraftEditor = reatomComponent(function FormDraftEditor({
  mode,
}: FormDraftEditorProps) {
  const { t } = useTranslation();
  const backButton = (
    <Button
      variant="ghost"
      onClick={() => {
        closeFormDraft();
        setActiveTab('forms', 'search');
      }}
    >
      {t('common.back')}
    </Button>
  );
  const modeTabs = <FormModeTabs mode={mode} />;
  const saveButton = (
    <Button
      type="button"
      size="sm"
      onClick={() => {
        saveFormDraft();
        setActiveTab('forms', 'search');
      }}
    >
      <FloppyDiskIcon />
      {t('design.actions.save')}
    </Button>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        {mode === 'preview' ? (
          <>
            <div className="mb-6 flex items-center justify-end gap-3">
              {modeTabs}
              {saveButton}
              {backButton}
            </div>

            <FormBuilderPreview classNames="mx-auto w-full lg:w-1/2 md:w-3/4" />
          </>
        ) : (
          <FormBuilder
            actions={
              <>
                {modeTabs}
                {saveButton}
                {backButton}
              </>
            }
          />
        )}
      </div>
    </div>
  );
});

interface FormModeTabsProps {
  mode: string;
}

const FormModeTabs = ({ mode }: FormModeTabsProps) => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t('sidebar.nav.formBuilder')}
      className="flex items-center gap-1 rounded-lg border bg-muted p-1"
    >
      {(['build', 'preview'] as const).map((tab) => (
        <Button
          key={tab}
          type="button"
          size="sm"
          variant={mode === tab ? 'default' : 'ghost'}
          aria-pressed={mode === tab}
          onClick={() => setActiveTab('forms', 'builder', tab)}
        >
          {t(`formBuilder.tabs.${tab}`)}
        </Button>
      ))}
    </div>
  );
};

const FormDraftList = reatomComponent(function FormDraftList() {
  const { t } = useTranslation();
  const forms = filteredFormsAtom();
  return (
    <section className="mx-auto flex h-full max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t('design.forms')}</h1>
        <Button
          onClick={() => {
            createFormDraft();
            setActiveTab('forms', 'builder', 'build');
          }}
        >
          {t('design.createForm')}
        </Button>
      </div>
      <Input
        aria-label={t('common.search')}
        placeholder={t('common.search')}
        value={formSearchAtom()}
        onChange={(event) => formSearchAtom.set(event.target.value)}
        className="max-w-md"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {forms.map((form) => {
          const title = form.name || t('design.untitledForm');
          const status = form.isDraft
            ? t('design.draft')
            : t('design.available');
          const { schema, uischema } = generateFormFromDomain(form);

          return (
            <button
              key={form.id}
              type="button"
              aria-label={`${title} — ${status}`}
              className="relative min-w-0 rounded-xl text-left transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                openFormDraft(form.id);
                setActiveTab('forms', 'builder', 'build');
              }}
            >
              <FormPreview
                inert
                schema={schema}
                uischema={uischema}
                title={title}
                className="w-full rounded-xl"
              />
              <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-card shadow-sm">
                {form.isDraft && (
                  <Badge
                    variant="filled"
                    intent={form.isDraft ? 'draft' : 'primary'}
                  >
                    {status}
                  </Badge>
                )}
              </span>
            </button>
          );
        })}
        {forms.length === 0 && (
          <p className="col-span-full py-8 text-center text-muted-foreground">
            {t('common.noResults')}
          </p>
        )}
      </div>
    </section>
  );
});
