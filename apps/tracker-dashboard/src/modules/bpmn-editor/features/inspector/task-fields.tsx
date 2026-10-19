import { reatomComponent } from '@reatom/react';

import type { TaskInfo } from '../../models/definitions/element-definitions';
import { suggestDecisionKey } from '../../models/definitions/task-definitions';
import { DecisionKeyField } from './decision-key-field';
import { FormField } from './form-field';
import { RolesField } from './roles-field';
import { ScriptField } from './script-field';

export interface TaskFieldsProps {
  selected: TaskInfo;
}

export const TaskFields = reatomComponent(function TaskFields({
  selected,
}: TaskFieldsProps) {
  if (selected.kind === 'scriptTask') {
    return <ScriptField expressions={selected.scriptExpressions} />;
  }

  return (
    <>
      <RolesField selectedRoles={selected.roles} />
      {selected.kind === 'approveTask' && (
        <DecisionKeyField
          elementId={selected.id}
          decisionKey={selected.decisionKey}
          suggestion={suggestDecisionKey(selected.name, selected.id)}
        />
      )}
      {selected.kind === 'formTask' && <FormField formKey={selected.formKey} />}
    </>
  );
});
