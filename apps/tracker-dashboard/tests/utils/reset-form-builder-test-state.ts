import {
  activeTabAtom,
  fieldsAtom,
  formNameAtom,
  layoutAtom,
  previewDataAtom,
  rulesAtom,
} from '@/modules/form-builder';

export function resetFormBuilderTestState(): void {
  fieldsAtom.set([]);
  layoutAtom.set([]);
  rulesAtom.set([]);
  formNameAtom.set('');
  previewDataAtom.set({});
  activeTabAtom.set('build');
}
