import { reatomComponent } from '@reatom/react';

import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';

import { isConnectionType } from '../model/diagram-api';
import {
  type SelectedElementInfo,
  selectedElementAtom,
} from '../model/editor-model';
import { TASK_DEFINITION_KEYS, isGatewayType } from '../model/task-definitions';
import { ConnectionInspector } from './inspector/connection-inspector';
import { GatewayFlowsField } from './inspector/gateway-flows-field';
import { NameField } from './inspector/name-field';
import { TaskFields } from './inspector/task-fields';

const TASK_DEFINITION_KEY_VALUES: string[] =
  Object.values(TASK_DEFINITION_KEYS);

const TASK_ELEMENT_TYPES: string[] = ['bpmn:UserTask', 'bpmn:ScriptTask'];

const isTaskElement = (selected: SelectedElementInfo): boolean =>
  TASK_ELEMENT_TYPES.includes(selected.type) &&
  selected.taskDefinitionKey !== null &&
  TASK_DEFINITION_KEY_VALUES.includes(selected.taskDefinitionKey);
const VARIANTS = [
  {
    matches: (selected: SelectedElementInfo) => isConnectionType(selected.type),
    render: (selected: SelectedElementInfo) => (
      <ConnectionInspector selected={selected} />
    ),
  },
  {
    matches: (selected: SelectedElementInfo) => isTaskElement(selected),
    render: (selected: SelectedElementInfo) => (
      <TaskFields selected={selected} />
    ),
  },
  {
    matches: (selected: SelectedElementInfo) => isGatewayType(selected.type),
    render: (selected: SelectedElementInfo) => (
      <GatewayFlowsField
        elementId={selected.id}
        outgoingFlows={selected.outgoingFlows}
      />
    ),
  },
] as const;

export const BpmnInspector = reatomComponent(function BpmnInspector() {
  const selected = selectedElementAtom();

  if (!selected) return null;

  const active = VARIANTS.find((variant) => variant.matches(selected));
  const content = active?.render(selected);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <NameField elementId={selected.id} value={selected.name} />
        {content}
      </div>
    </ScrollArea>
  );
});
