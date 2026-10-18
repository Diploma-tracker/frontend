import { k } from '@/shared/utils/i18n';

/** Gateway element types, in the order the properties panel lists them. */
export const GATEWAY_ELEMENT_TYPES = [
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ParallelGateway',
  'bpmn:EventBasedGateway',
] as const;

export type GatewayElementType = (typeof GATEWAY_ELEMENT_TYPES)[number];

export const isGatewayElementType = (type: string): boolean =>
  (GATEWAY_ELEMENT_TYPES as readonly string[]).includes(type);

/** Palette label key backing each gateway type option. */
const GATEWAY_LABEL_KEYS: Record<GatewayElementType, string> = {
  'bpmn:ExclusiveGateway': 'exclusiveGateway',
  'bpmn:InclusiveGateway': 'inclusiveGateway',
  'bpmn:ParallelGateway': 'parallelGateway',
  'bpmn:EventBasedGateway': 'eventBasedGateway',
};

export interface GatewayTypeOption {
  value: GatewayElementType;
  labelKey: string;
}

export const gatewayTypeOptions = (): GatewayTypeOption[] =>
  GATEWAY_ELEMENT_TYPES.map((value) => ({
    value,
    labelKey: k(`bpmnEditor.palette.${GATEWAY_LABEL_KEYS[value]}`),
  }));
