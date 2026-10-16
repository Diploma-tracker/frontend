import flagIcon from '@phosphor-icons/core/assets/regular/flag.svg?raw';
import type {
  Attrs,
  default as BpmnRenderer,
} from 'bpmn-js/lib/draw/BpmnRenderer';
import type { Element, Shape } from 'bpmn-js/lib/model/Types';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import type EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { STAGE_ATTR } from './stage-definitions';

/**
 * Stage paint. The values resolve against the diagram tokens in
 * `packages/tailwind-config/tokens.css`, so stages read apart from ordinary
 * subprocesses and still follow the light/dark theme.
 */
const STAGE_FILL = 'var(--bpmn-stage-bg)';
const STAGE_STROKE = 'var(--bpmn-stage-stroke)';

/** Size and offset of the flag glyph on the shape. */
const ICON_SIZE = 20;
const ICON_TRANSFORM = 'translate(12, 10)';

const SVG_NS = 'http://www.w3.org/2000/svg';

const isStageElement = (element: Element): boolean =>
  is(element, 'bpmn:SubProcess') &&
  getBusinessObject(element).get(STAGE_ATTR) === true;

/** Colours set through the properties panel win over the stage defaults. */
const resolveColors = (element: Shape): { fill: string; stroke: string } => ({
  fill: element.di?.get('color:background-color') ?? STAGE_FILL,
  stroke: element.di?.get('color:border-color') ?? STAGE_STROKE,
});

const drawIcon = (parentGfx: SVGElement, color: string): void => {
  const group = document.createElementNS(SVG_NS, 'g');

  group.setAttribute('transform', ICON_TRANSFORM);
  // The asset paints with `currentColor`, so the accent propagates from here.
  group.style.color = color;
  group.innerHTML = flagIcon;

  const icon = group.firstElementChild;

  // A nested <svg> without a size fills the whole viewport, so pin it down.
  icon?.setAttribute('width', String(ICON_SIZE));
  icon?.setAttribute('height', String(ICON_SIZE));

  parentGfx.appendChild(group);
};

/**
 * Colours subprocesses flagged as stages and gives them a flag glyph, so a
 * stage reads apart from an ordinary subprocess at a glance. Runs above the
 * built-in `bpmnRenderer` and delegates the drawing to it, only overriding the
 * fill, stroke and marker.
 */
export default class StageRenderer extends BaseRenderer {
  static $inject = ['eventBus', 'bpmnRenderer'];

  private readonly bpmnRenderer: BpmnRenderer;

  constructor(eventBus: EventBus, bpmnRenderer: BpmnRenderer) {
    super(eventBus, 1401);
    this.bpmnRenderer = bpmnRenderer;
  }

  override canRender(element: Element): boolean {
    return isStageElement(element);
  }

  override drawShape(
    parentGfx: SVGElement,
    element: Shape,
    attrs: Attrs = {},
  ): SVGElement {
    const colors = resolveColors(element);

    const shape = this.bpmnRenderer.drawShape(parentGfx, element, {
      ...attrs,
      ...colors,
    });

    shape.setAttribute('stroke-width', '2');
    drawIcon(parentGfx, colors.stroke);

    return shape;
  }
}
