import { reatomComponent } from '@reatom/react';

import {
  addRule,
  commit,
  fieldsAtom,
  removeRule,
  rulesAtom,
  selectField,
  selectedFieldNameAtom,
  updateFieldProps,
} from '../model/builder-state';
import { PropertiesPanel } from './properties-panel';
import { ValidationRulesPanel } from './validation-rules-panel';

export const FormPanel = reatomComponent(function FormPanel() {
  const fields = fieldsAtom();
  const rules = rulesAtom();
  const selectedId = selectedFieldNameAtom();

  const selectedField =
    fields.find((field) => field.name === selectedId) ?? null;

  if (selectedField) {
    return (
      <PropertiesPanel
        field={selectedField}
        onBack={() => selectField(null)}
        onUpdate={(name, patch) => {
          updateFieldProps(name, patch);
          commit();
        }}
      />
    );
  }

  return (
    <ValidationRulesPanel
      rules={rules}
      fields={fields}
      onAdd={(rule) => {
        addRule(rule);
        commit();
      }}
      onRemove={(ruleId) => {
        removeRule(ruleId);
        commit();
      }}
    />
  );
});
