import { useState } from 'react';

import { availableFormsAtom, generateFormFromDomain } from '@/modules/forms';
import { FormPreview } from '@/shared/components/json-forms';
import { CREATE_DESIGN_FORM_EVENT } from '@/shared/events/design';
import { useTranslation } from '@/shared/utils/i18n';
import { CaretDownIcon, PlusIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui-kit/components/common/floating/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';

import { setSelectedFormKey } from '../../models/actions/tasks';

export interface FormFieldProps {
  formKey: string | null;
}

export const FormField = reatomComponent(function FormField({
  formKey,
}: FormFieldProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const availableForms = availableFormsAtom();
  const filteredForms = availableForms.filter((form) =>
    form.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const selectedForm = availableForms.find((form) => form.id === formKey);
  const closeSelector = () => {
    setIsOpen(false);
    setSearch('');
  };
  const createFormTile = (
    <button
      type="button"
      aria-label={t('design.actions.createForm')}
      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      onClick={() => {
        closeSelector();
        globalThis.dispatchEvent(new Event(CREATE_DESIGN_FORM_EVENT));
      }}
    >
      <PlusIcon className="size-8" />
      <span className="text-sm font-medium">
        {t('design.actions.createForm')}
      </span>
    </button>
  );

  return (
    <Field orientation="vertical" className="w-full gap-2">
      <FieldLabel>{t('bpmnEditor.inspector.form')}</FieldLabel>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-0 flex-1 justify-between font-normal"
          onClick={() => setIsOpen(true)}
        >
          <span className="truncate">
            {selectedForm?.name ??
              formKey ??
              t('bpmnEditor.inspector.formPlaceholder')}
          </span>
          <CaretDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('design.actions.createForm')}
              onClick={() =>
                globalThis.dispatchEvent(new Event(CREATE_DESIGN_FORM_EVENT))
              }
            >
              <PlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('design.actions.createForm')}</TooltipContent>
        </Tooltip>
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSearch('');
        }}
      >
        <DialogContent className="grid h-[min(80dvh,48rem)] max-h-[calc(100dvh-2rem)] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t('design.formSelector.title')}</DialogTitle>
            <DialogDescription>
              {t('design.formSelector.description')}
            </DialogDescription>
          </DialogHeader>
          <Input
            aria-label={t('design.formSelector.searchPlaceholder')}
            placeholder={t('design.formSelector.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="relative min-h-0 overflow-y-auto">
            {filteredForms.length === 0 ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-muted-foreground">
                  {t('design.formSelector.noForms')}
                </div>
                <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {createFormTile}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {createFormTile}
                {filteredForms.map((form) => {
                  const { schema, uischema } = generateFormFromDomain(form);

                  return (
                    <button
                      key={form.id}
                      type="button"
                      aria-label={form.name}
                      className="relative min-w-0 rounded-xl text-left outline-none focus-visible:after:pointer-events-none focus-visible:after:absolute focus-visible:after:inset-0 focus-visible:after:rounded-xl focus-visible:after:border-2 focus-visible:after:border-primary focus-visible:after:content-['']"
                      onClick={() => {
                        setSelectedFormKey(form.id);
                        closeSelector();
                      }}
                    >
                      <FormPreview
                        inert
                        schema={schema}
                        uischema={uischema}
                        title={form.name}
                        className="w-full rounded-xl"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Field>
  );
});
