import { reatomComponent } from '@reatom/react';

import { type ConnectionInfo } from '../../models/definitions/element-definitions';
import { ConditionField } from './condition-field';

export interface ConnectionInspectorProps {
  selected: ConnectionInfo;
}

export const ConnectionInspector = reatomComponent(
  function ConnectionInspector({ selected }: ConnectionInspectorProps) {
    return (
      <div className="flex flex-col gap-4 rounded-md border bg-muted/30 p-3">
        <ConditionField
          elementId={selected.id}
          conditionExpression={selected.conditionExpression}
          isDefaultFlow={selected.isDefaultFlow}
          sourceIsGateway={selected.sourceIsGateway}
          feedingDecisionKey={selected.feedingDecisionKey}
        />
      </div>
    );
  },
);
