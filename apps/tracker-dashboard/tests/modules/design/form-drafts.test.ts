import {
  closeFormDraft,
  createFormDraft,
  discardFormDraft,
  draftsAtom,
  formSearchAtom,
  openFormDraft,
  saveFormDraft,
  selectedFormIdAtom,
} from '@/modules/design';
import {
  availableFormsAtom,
  commit,
  fieldsAtom,
  formNameAtom,
  layoutAtom,
  placeField,
  previewDataAtom,
  rulesAtom,
} from '@/modules/forms';
import { beforeEach, expect, it } from 'vitest';

const initialAvailableForms = availableFormsAtom();

beforeEach(() => {
  draftsAtom.set([]);
  availableFormsAtom.set(initialAvailableForms);
  selectedFormIdAtom.set(null);
  formSearchAtom.set('');
  fieldsAtom.set([]);
  layoutAtom.set([]);
  rulesAtom.set([]);
  formNameAtom.set('');
  previewDataAtom.set({});
  commit();
});

it('moves an edited available form and a new form into drafts until saved', () => {
  const [availableForm] = availableFormsAtom();
  expect(availableForm).toBeDefined();
  if (!availableForm) throw new Error('Expected a preloaded available form');

  openFormDraft(availableForm.id);
  expect(
    availableFormsAtom().some((form) => form.id === availableForm.id),
  ).toBe(false);
  expect(draftsAtom().some((form) => form.id === availableForm.id)).toBe(true);

  formNameAtom.set('Edited registration');
  closeFormDraft();
  openFormDraft(availableForm.id);
  expect(formNameAtom()).toBe('Edited registration');
  saveFormDraft();

  const savedAvailableForm = availableFormsAtom().find(
    (form) => form.id === availableForm.id,
  );
  expect(savedAvailableForm).toMatchObject({
    name: 'Edited registration',
  });
  expect(draftsAtom().some((form) => form.id === availableForm.id)).toBe(false);

  openFormDraft(availableForm.id);
  formNameAtom.set('Changes to discard');
  discardFormDraft();
  expect(
    availableFormsAtom().find((form) => form.id === availableForm.id)?.name,
  ).toBe('Edited registration');

  createFormDraft();
  const newFormId = selectedFormIdAtom();
  expect(newFormId).not.toBeNull();
  formNameAtom.set('New draft');
  placeField({
    name: 'title',
    kind: 'string',
    schema: { type: 'string' },
    label: 'Title',
    required: true,
  });
  saveFormDraft();

  expect(draftsAtom().some((form) => form.id === newFormId)).toBe(false);
  expect(availableFormsAtom()).toContainEqual(
    expect.objectContaining({
      id: newFormId,
      name: 'New draft',
    }),
  );
});
