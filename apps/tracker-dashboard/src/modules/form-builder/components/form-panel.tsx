import { reatomComponent } from '@reatom/react';

import {
  addRule,
  commit,
  fieldsAtom,
  removeRule,
  rulesAtom,
  selectField,
  selectedFieldIdAtom,
  updateFieldProps,
} from '../model/form-builder-model';
import { PropertiesPanel } from './properties-panel';
import { ValidationRulesPanel } from './validation-rules-panel';

export const FormPanel = reatomComponent(function FormPanel() {
  const fields = fieldsAtom();
  const rules = rulesAtom();
  const selectedId = selectedFieldIdAtom();

  const selectedField =
    fields.find((field) => field.instanceId === selectedId) ?? null;

  if (selectedField) {
    return (
      <PropertiesPanel
        field={selectedField}
        onBack={() => selectField(null)}
        onUpdate={(instanceId, patch) => {
          updateFieldProps(instanceId, patch);
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
