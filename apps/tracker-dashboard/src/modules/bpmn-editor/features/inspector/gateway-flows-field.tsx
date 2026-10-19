import { useTranslation } from '@/shared/utils/i18n';
import { FlagIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Checkbox } from '@repo/ui-kit/components/common/form/checkbox';
import { Label } from '@repo/ui-kit/components/common/form/label';
import { cn } from '@repo/ui-kit/lib/utils';

import { setGatewayDefaultFlow } from '../../models/actions/gateways';
import type { GatewayFlowInfo } from '../../models/definitions/element-definitions';

export interface GatewayFlowsFieldProps {
  elementId: string;
  outgoingFlows: GatewayFlowInfo[];
}

export const GatewayFlowsField = reatomComponent(function GatewayFlowsField({
  elementId,
  outgoingFlows,
}: GatewayFlowsFieldProps) {
  const { t } = useTranslation();

  if (outgoingFlows.length === 0) return null;

  const hasDefault = outgoingFlows.some((flow) => flow.isDefault);
  const conditional = outgoingFlows.filter(
    (flow) => flow.conditionExpression !== null,
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {t('bpmnEditor.inspector.outgoingFlowsHeading')}
      </h3>
      <div className="flex flex-col gap-2">
        {outgoingFlows.map((flow) => {
          const isDefault = flow.isDefault;

          return (
            <Label
              key={`${elementId}:${flow.id}`}
              className={cn(
                'items-start gap-2 rounded-md border p-2 text-sm font-normal transition-colors',
                isDefault
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-transparent',
              )}
            >
              <Checkbox
                className="mt-0.5"
                checked={isDefault}
                onCheckedChange={(checked) =>
                  setGatewayDefaultFlow(checked === true ? flow.id : null)
                }
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-medium">
                    {flow.name || flow.id}
                  </span>
                  {isDefault && (
                    <Badge variant="filled" intent="primary">
                      <FlagIcon className="size-3" />
                      {t('bpmnEditor.inspector.conditionDefaultBadge')}
                    </Badge>
                  )}
                </span>
                <span
                  className={cn(
                    'truncate text-xs',
                    isDefault
                      ? 'text-primary'
                      : flow.conditionExpression
                        ? 'font-mono text-muted-foreground'
                        : 'text-muted-foreground italic',
                  )}
                >
                  {isDefault
                    ? t('bpmnEditor.inspector.conditionFallback')
                    : (flow.conditionExpression ??
                      t('bpmnEditor.inspector.conditionNone'))}
                </span>
              </span>
            </Label>
          );
        })}
      </div>
      {conditional > 1 && !hasDefault && (
        <p className="text-xs text-muted-foreground">
          {t('bpmnEditor.inspector.defaultFlowHint')}
        </p>
      )}
    </div>
  );
});
