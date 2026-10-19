import { reatomComponent } from '@reatom/react';

import { ScrollArea } from '@repo/ui-kit/components/common/layout/scroll-area';

import type { ElementInfo } from '../models/definitions/element-definitions';
import { selectedElementAtom } from '../models/editor-model';
import { ConnectionInspector } from './inspector/connection-inspector';
import { EventField } from './inspector/event-field';
import { GatewayField } from './inspector/gateway-field';
import { GeneralInspector } from './inspector/general-inspector';
import { NameField } from './inspector/name-field';
import { SubProcessField } from './inspector/subprocess-field';
import { TaskFields } from './inspector/task-fields';

const renderFields = (selected: ElementInfo) => {
  switch (selected.kind) {
    case 'connection':
      return <ConnectionInspector selected={selected} />;
    case 'task':
    case 'approveTask':
    case 'formTask':
    case 'scriptTask':
      return <TaskFields selected={selected} />;
    case 'subProcess':
      return <SubProcessField selected={selected} />;
    case 'gateway':
      return <GatewayField selected={selected} />;
    case 'event':
      return <EventField selected={selected} />;
    default:
      return null;
  }
};

export const BpmnInspector = reatomComponent(function BpmnInspector() {
  const selected = selectedElementAtom();

  if (!selected) {
    return <GeneralInspector />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <NameField elementId={selected.id} value={selected.name} />
        {renderFields(selected)}
      </div>
    </ScrollArea>
  );
});
