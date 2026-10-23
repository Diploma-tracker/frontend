import {
  availableFormsAtom,
  commit,
  formDefinition,
  loadDefinition,
} from '@/modules/forms';
import type { FormDefinition } from '@/modules/forms';
import { action, atom, computed } from '@reatom/core';

export interface DesignForm extends FormDefinition {
  isDraft: boolean;
  draftOrigin?: 'new' | 'available';
  originalForm?: FormDefinition;
}

export const draftsAtom = atom<DesignForm[]>([], 'design.forms.drafts');
const formsAtom = computed(
  () => [
    ...draftsAtom(),
    ...availableFormsAtom().map((form) => ({ ...form, isDraft: false })),
  ],
  'design.forms.all',
);

export const selectedFormIdAtom = atom<string | null>(
  null,
  'design.forms.selected',
);
export const formSearchAtom = atom('', 'design.forms.search');
export const filteredFormsAtom = computed(() => {
  const query = formSearchAtom().trim().toLocaleLowerCase();
  return formsAtom().filter((form) =>
    form.name.toLocaleLowerCase().includes(query),
  );
}, 'design.forms.filtered');

const snapshotCurrent = (): void => {
  const id = selectedFormIdAtom();
  if (!id) return;

  commit();
  const existingDraft = draftsAtom().find((form) => form.id === id);
  const snapshot: DesignForm = {
    ...formDefinition(),
    isDraft: true,
    draftOrigin: existingDraft?.draftOrigin ?? 'new',
    ...(existingDraft?.originalForm
      ? { originalForm: existingDraft.originalForm }
      : {}),
  };
  draftsAtom.set((drafts) => {
    const exists = drafts.some((form) => form.id === id);
    return exists
      ? drafts.map((form) => (form.id === id ? snapshot : form))
      : [...drafts, snapshot];
  });
};

export const openFormDraft = action((id: string) => {
  snapshotCurrent();

  const existingDraft = draftsAtom().find((form) => form.id === id);
  if (existingDraft) {
    loadDefinition(existingDraft);
    selectedFormIdAtom.set(id);
    return;
  }

  const availableForm = availableFormsAtom().find((form) => form.id === id);
  if (!availableForm) return;

  const draft: DesignForm = {
    ...availableForm,
    isDraft: true,
    draftOrigin: 'available',
    originalForm: availableForm,
  };
  availableFormsAtom.set((forms) => forms.filter((form) => form.id !== id));
  draftsAtom.set((forms) => [...forms, draft]);
  loadDefinition(draft);
  selectedFormIdAtom.set(id);
});

export const createFormDraft = action(() => {
  const id = globalThis.crypto.randomUUID();
  const draft: DesignForm = {
    id,
    name: '',
    fields: [],
    validation_rules: [],
    ui: [],
    isDraft: true,
    draftOrigin: 'new',
  };
  draftsAtom.set((forms) => [...forms, draft]);
  openFormDraft(id);
});

/** Saves a draft by moving it into the available forms collection. */
export const saveFormDraft = action(() => {
  const id = selectedFormIdAtom();
  if (!id) return;

  snapshotCurrent();
  const draft = draftsAtom().find((form) => form.id === id);
  if (!draft) return;

  const availableForm: FormDefinition = {
    id: draft.id,
    name: draft.name,
    fields: draft.fields,
    validation_rules: draft.validation_rules,
    ui: draft.ui,
  };
  availableFormsAtom.set((forms) => [
    ...forms.filter((form) => form.id !== id),
    availableForm,
  ]);
  draftsAtom.set((forms) => forms.filter((form) => form.id !== id));
  selectedFormIdAtom.set(null);
});

/** Discards the current draft, restoring an original available form if edited. */
export const discardFormDraft = action(() => {
  const id = selectedFormIdAtom();
  if (!id) return;

  const draft = draftsAtom().find((form) => form.id === id);
  const originalForm =
    draft?.draftOrigin === 'available' ? draft.originalForm : undefined;
  if (originalForm) {
    availableFormsAtom.set((forms) => [
      ...forms.filter((form) => form.id !== id),
      originalForm,
    ]);
  }

  draftsAtom.set((forms) => forms.filter((form) => form.id !== id));
  selectedFormIdAtom.set(null);
});

export const closeFormDraft = action(() => {
  snapshotCurrent();
  selectedFormIdAtom.set(null);
});
