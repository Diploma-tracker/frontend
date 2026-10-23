import { commit, formDefinition, loadDefinition } from '@/modules/forms';
import type { FormDefinition } from '@/modules/forms';
import { action, atom, computed } from '@reatom/core';

export interface DesignForm extends FormDefinition {
  isDraft: boolean;
}

const initialAvailableForms: DesignForm[] = [
  {
    id: 'student-registration',
    name: 'Student registration',
    isDraft: false,
    fields: [
      {
        name: 'full_name',
        kind: 'string',
        schema: { type: 'string', minLength: 1 },
        label: 'Full name',
        required: true,
      },
      {
        name: 'email',
        kind: 'string',
        schema: { type: 'string', format: 'email' },
        label: 'Email',
        required: true,
      },
    ],
    validation_rules: [],
    ui: [['full_name'], ['email']],
  },
  {
    id: 'project-proposal',
    name: 'Project proposal',
    isDraft: false,
    fields: [
      {
        name: 'title',
        kind: 'string',
        schema: { type: 'string', minLength: 1 },
        label: 'Project title',
        required: true,
      },
      {
        name: 'summary',
        kind: 'string',
        schema: { type: 'string' },
        label: 'Summary',
        required: false,
      },
    ],
    validation_rules: [],
    ui: [['title'], ['summary']],
  },
];

export const draftsAtom = atom<DesignForm[]>([], 'design.forms.drafts');
export const availableFormsAtom = atom<DesignForm[]>(
  initialAvailableForms,
  'design.forms.available',
);
const formsAtom = computed(
  () => [...draftsAtom(), ...availableFormsAtom()],
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
  const snapshot: DesignForm = { ...formDefinition(), isDraft: true };
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

  const draft: DesignForm = { ...availableForm, isDraft: true };
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

  const availableForm: DesignForm = { ...draft, isDraft: false };
  availableFormsAtom.set((forms) => [
    ...forms.filter((form) => form.id !== id),
    availableForm,
  ]);
  draftsAtom.set((forms) => forms.filter((form) => form.id !== id));
  selectedFormIdAtom.set(null);
});

export const closeFormDraft = action(() => {
  snapshotCurrent();
  selectedFormIdAtom.set(null);
});
