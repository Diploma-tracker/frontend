import checkSquareIcon from '@phosphor-icons/core/assets/regular/check-square.svg?raw';
import codeIcon from '@phosphor-icons/core/assets/regular/code.svg?raw';
import fileTextIcon from '@phosphor-icons/core/assets/regular/file-text.svg?raw';
import shieldCheckIcon from '@phosphor-icons/core/assets/regular/shield-check.svg?raw';
import type {
  Attrs,
  default as BpmnRenderer,
} from 'bpmn-js/lib/draw/BpmnRenderer';
import type { Element, Shape } from 'bpmn-js/lib/model/Types';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import type EventBus from 'diagram-js/lib/core/EventBus';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { TASK_DEFINITION_KEYS } from './task-definitions';

/**
 * Per-kind paint and glyph. Colours resolve against the diagram tokens in
 * `packages/tailwind-config/tokens.css`, so the kinds read apart and still
 * follow the light/dark theme.
 */
const TASK_STYLES: Record<string, { fill: string; stroke: string }> = {
  [TASK_DEFINITION_KEYS.approve]: {
    fill: 'var(--bpmn-task-approve-bg)',
    stroke: 'var(--bpmn-task-approve-stroke)',
  },
  [TASK_DEFINITION_KEYS.fillProjectFields]: {
    fill: 'var(--bpmn-task-fields-bg)',
    stroke: 'var(--bpmn-task-fields-stroke)',
  },
  [TASK_DEFINITION_KEYS.registerProjectForDefense]: {
    fill: 'var(--bpmn-task-register-bg)',
    stroke: 'var(--bpmn-task-register-stroke)',
  },
  [TASK_DEFINITION_KEYS.script]: {
    fill: 'var(--bpmn-task-script-bg)',
    stroke: 'var(--bpmn-task-script-stroke)',
  },
};

/**
 * The Phosphor icon each task kind shows, matching the palette entries. The
 * canvas is raw SVG, so the framework-agnostic assets from
 * `@phosphor-icons/core` are embedded directly — the same artwork the palette
 * components use.
 */
const TASK_ICONS: Record<string, string> = {
  [TASK_DEFINITION_KEYS.approve]: checkSquareIcon,
  [TASK_DEFINITION_KEYS.fillProjectFields]: fileTextIcon,
  [TASK_DEFINITION_KEYS.registerProjectForDefense]: shieldCheckIcon,
  [TASK_DEFINITION_KEYS.script]: codeIcon,
};

const ICON_SIZE = 16;

/** Places the icon in the task's top-left corner. */
const ICON_TRANSFORM = 'translate(12, 10)';

/**
 * `bpmnRenderer` paints each task type with a trailing glyph: three paths for a
 * user task, a single path for a script task. They are dropped so the per-kind
 * glyph can take their place.
 */
const DEFAULT_ICON_PATHS: Record<string, number> = {
  'bpmn:UserTask': 3,
  'bpmn:ScriptTask': 1,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const getTaskKind = (element: Element): string | null => {
  if (!is(element, 'bpmn:UserTask') && !is(element, 'bpmn:ScriptTask')) {
    return null;
  }

  const key = getBusinessObject(element).get('taskDefinitionKey');

  return typeof key === 'string' && key in TASK_STYLES ? key : null;
};

const getTaskStyle = (
  element: Element,
): { fill: string; stroke: string } | null => {
  const kind = getTaskKind(element);

  return kind ? (TASK_STYLES[kind] ?? null) : null;
};

/** Colours set through the properties panel win over the per-kind defaults. */
const resolveColors = (
  element: Shape,
  style: { fill: string; stroke: string },
): { fill: string; stroke: string } => ({
  fill: element.di?.get('color:background-color') ?? style.fill,
  stroke: element.di?.get('color:border-color') ?? style.stroke,
});

const removeDefaultIcon = (parentGfx: SVGElement, iconPaths: number): void => {
  const children = Array.from(parentGfx.childNodes);

  // Keep the task rectangle; only the trailing icon paths are removed.
  if (children.length <= iconPaths) return;

  children
    .slice(-iconPaths)
    .forEach((child) => child.parentNode?.removeChild(child));
};

const drawIcon = (parentGfx: SVGElement, kind: string, color: string): void => {
  const markup = TASK_ICONS[kind];

  if (!markup) return;

  const group = document.createElementNS(SVG_NS, 'g');

  group.setAttribute('transform', ICON_TRANSFORM);
  // The assets paint with `currentColor`, so the accent propagates from here.
  group.style.color = color;
  group.innerHTML = markup;

  const icon = group.firstElementChild;

  // A nested <svg> without a size fills the whole viewport, so pin it down.
  icon?.setAttribute('width', String(ICON_SIZE));
  icon?.setAttribute('height', String(ICON_SIZE));

  parentGfx.appendChild(group);
};

/**
 * Colours the supported task kinds (approve, fill-project-fields,
 * register-project-for-defense, script) and replaces their icon so each kind is
 * recognisable on the canvas. It runs at a higher priority than the built-in
 * `bpmnRenderer`, delegates the actual drawing to it, then decorates the
 * result.
 */
export default class TaskRenderer extends BaseRenderer {
  static $inject = ['eventBus', 'bpmnRenderer'];

  private readonly bpmnRenderer: BpmnRenderer;

  constructor(eventBus: EventBus, bpmnRenderer: BpmnRenderer) {
    super(eventBus, 1400);
    this.bpmnRenderer = bpmnRenderer;
  }

  override canRender(element: Element): boolean {
    return getTaskStyle(element) !== null;
  }

  override drawShape(
    parentGfx: SVGElement,
    element: Shape,
    attrs: Attrs = {},
  ): SVGElement {
    const style = getTaskStyle(element);

    if (!style) {
      return this.bpmnRenderer.drawShape(parentGfx, element, attrs);
    }

    const colors = resolveColors(element, style);

    const shape = this.bpmnRenderer.drawShape(parentGfx, element, {
      ...attrs,
      ...colors,
    });

    shape.setAttribute('stroke-width', '2');

    removeDefaultIcon(parentGfx, DEFAULT_ICON_PATHS[element.type] ?? 0);
    drawIcon(parentGfx, getTaskKind(element) as string, colors.stroke);

    return shape;
  }
}
