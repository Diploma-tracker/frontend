import { reatomComponent } from '@reatom/react';

import type { SelectedElementInfo } from '../../model/editor-model';
import {
  TASK_DEFINITION_KEYS,
  isApproveTask,
  isScriptTask,
  suggestDecisionKey,
} from '../../model/task-definitions';
import { DecisionKeyField } from './decision-key-field';
import { FormField } from './form-field';
import { RolesField } from './roles-field';
import { ScriptField } from './script-field';

export interface TaskFieldsProps {
  selected: SelectedElementInfo;
}

export const TaskFields = reatomComponent(function TaskFields({
  selected,
}: TaskFieldsProps) {
  if (isScriptTask(selected.taskDefinitionKey)) {
    return <ScriptField expressions={selected.scriptExpressions} />;
  }

  return (
    <>
      <RolesField selectedRoles={selected.roles} />
      {isApproveTask(selected.taskDefinitionKey) && (
        <DecisionKeyField
          elementId={selected.id}
          decisionKey={selected.decisionKey}
          suggestion={suggestDecisionKey(selected.name, selected.id)}
        />
      )}
      {selected.taskDefinitionKey ===
        TASK_DEFINITION_KEYS.fillProjectFields && (
        <FormField formKey={selected.formKey} />
      )}
    </>
  );
});
