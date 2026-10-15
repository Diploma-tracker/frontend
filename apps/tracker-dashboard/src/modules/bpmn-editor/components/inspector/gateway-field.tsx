import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Field, FieldLabel } from '@repo/ui-kit/components/common/form/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

import {
  type SelectedElementInfo,
  setSelectedGatewayType,
} from '../../model/editor-model';
import { gatewayTypeOptions } from '../../model/gateway-definitions';
import { isGatewayType } from '../../model/task-definitions';
import { GatewayFlowsField } from './gateway-flows-field';

export interface GatewayFieldProps {
  selected: SelectedElementInfo;
}

/**
 * Properties for the selected gateway: its type, plus the outgoing-branch
 * editor for the types whose flows may carry a condition or default.
 */
export const GatewayField = reatomComponent(function GatewayField({
  selected,
}: GatewayFieldProps) {
  const { t } = useTranslation();
  const options = gatewayTypeOptions();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-md border bg-muted/30 p-3">
        <Field orientation="vertical" className="w-full gap-2">
          <FieldLabel>{t('bpmnEditor.inspector.gatewayType')}</FieldLabel>
          <Select
            value={selected.type}
            onValueChange={(next) => setSelectedGatewayType(next)}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue className="min-w-0 truncate" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {isGatewayType(selected.type) && (
        <GatewayFlowsField
          elementId={selected.id}
          outgoingFlows={selected.outgoingFlows}
        />
      )}
    </div>
  );
});
