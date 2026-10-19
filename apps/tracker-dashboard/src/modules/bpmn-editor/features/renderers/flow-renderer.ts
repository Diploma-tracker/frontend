import type {
  Attrs,
  default as BpmnRenderer,
} from 'bpmn-js/lib/draw/BpmnRenderer';
import type { Connection, Element } from 'bpmn-js/lib/model/Types';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import type EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { parseApprovalCondition } from '../../models/definitions/task-definitions';

/**
 * Gateway branches that get their own colour, so an approve path reads apart
 * from a reject (or hand-written) path at a glance. The values resolve against
 * the diagram tokens in `packages/tailwind-config/tokens.css`.
 */
const BRANCH_COLORS = {
  approve: 'var(--bpmn-flow-approve)',
  reject: 'var(--bpmn-flow-reject)',
  custom: 'var(--bpmn-flow-custom)',
} as const;

type Branch = keyof typeof BRANCH_COLORS;

/** Condition expression body of a flow, or an empty string when unset. */
const getConditionBody = (element: Element): string => {
  const body = element.businessObject?.conditionExpression?.body;

  return typeof body === 'string' ? body : '';
};

/** `source` only exists on connections, so it is unwrapped structurally. */
const getSource = (element: Element): Element | undefined =>
  (element as { source?: Element }).source;

/**
 * Resolves a sequence flow's branch from its condition expression only — never
 * its (arbitrary, user-facing) name. The gateway's default (fallback) flow is
 * never a branch: it carries no condition and is drawn in the neutral default
 * colour. A condition that is not a plain `decisionKey == 'approve'|'reject'`
 * approval (anything hand-written) is marked `custom`.
 */
const getFlowBranch = (element: Element): Branch | null => {
  if (!is(element, 'bpmn:SequenceFlow')) return null;

  const source = getSource(element);

  if (!source || !is(source, 'bpmn:Gateway')) return null;

  if (source.businessObject?.default === element.businessObject) return null;

  const body = getConditionBody(element).trim();

  if (body.length === 0) return null;

  const parsed = parseApprovalCondition(body);

  if (!parsed) return 'custom';

  return parsed.value === 'reject' ? 'reject' : 'approve';
};

/** Colours set through the properties panel win over the branch default. */
const resolveColors = (
  element: Element,
  color: string,
): { fill: string; stroke: string } => ({
  fill: element.di?.get('color:background-color') ?? color,
  stroke: element.di?.get('color:border-color') ?? color,
});

/**
 * Paints gateway outgoing flows by branch (approve / reject / custom). It runs
 * above the built-in `bpmnRenderer` and delegates the drawing to it, only
 * overriding the line and arrowhead colours via `attrs` — which the
 * sequence-flow handler forwards to both the path and its marker.
 */
export default class FlowRenderer extends BaseRenderer {
  static $inject = ['eventBus', 'bpmnRenderer'];

  private readonly bpmnRenderer: BpmnRenderer;

  constructor(eventBus: EventBus, bpmnRenderer: BpmnRenderer) {
    super(eventBus, 1500);
    this.bpmnRenderer = bpmnRenderer;
  }

  override canRender(element: Element): boolean {
    return getFlowBranch(element) !== null;
  }

  override drawConnection(
    parentGfx: SVGElement,
    element: Connection,
    attrs: Attrs = {},
  ): SVGElement {
    const branch = getFlowBranch(element);

    if (!branch) {
      return this.bpmnRenderer.drawConnection(parentGfx, element, attrs);
    }

    return this.bpmnRenderer.drawConnection(parentGfx, element, {
      ...attrs,
      ...resolveColors(element, BRANCH_COLORS[branch]),
    });
  }
}
