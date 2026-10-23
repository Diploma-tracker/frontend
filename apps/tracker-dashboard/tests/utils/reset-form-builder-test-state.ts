import {
  fieldsAtom,
  formIdAtom,
  formNameAtom,
  layoutAtom,
  previewDataAtom,
  rulesAtom,
} from '@/modules/forms';

export function resetFormBuilderTestState(): void {
  fieldsAtom.set([]);
  formIdAtom.set('');
  layoutAtom.set([]);
  rulesAtom.set([]);
  formNameAtom.set('');
  previewDataAtom.set({});
}
