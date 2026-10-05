import BpmnModeler from 'bpmn-js/lib/Modeler';
import type ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import type BpmnReplace from 'bpmn-js/lib/features/replace/BpmnReplace';
import type { TargetElement } from 'bpmn-js/lib/features/replace/BpmnReplace';
import type { Element, Parent, Shape } from 'bpmn-js/lib/model/Types';
import type CommandStack from 'diagram-js/lib/command/CommandStack';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type EventBus from 'diagram-js/lib/core/EventBus';
import type CopyPaste from 'diagram-js/lib/features/copy-paste/CopyPaste';
import type GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect';
import type HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
import type LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
import type Selection from 'diagram-js/lib/features/selection/Selection';
import type SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';
import type ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager';
import type { ElementLike, ShapeLike } from 'diagram-js/lib/model/Types';

import type { EditorToolName, PaletteElement } from './element-catalog';

/** BPMN types that only make sense as a connection. */
const CONNECTION_TYPES: string[] = [
  'bpmn:SequenceFlow',
  'bpmn:MessageFlow',
  'bpmn:Association',
  'bpmn:DataAssociation',
];

export interface EditorServices {
  canvas: Canvas;
  eventBus: EventBus;
  elementRegistry: ElementRegistry;
  modeling: Modeling;
  elementFactory: ElementFactory;
  bpmnReplace: BpmnReplace;
  selection: Selection;
  copyPaste: CopyPaste;
  commandStack: CommandStack;
  toolManager: ToolManager;
  handTool: HandTool;
  lassoTool: LassoTool;
  spaceTool: SpaceTool;
  globalConnect: GlobalConnect;
}

export const getServices = (modeler: BpmnModeler): EditorServices => ({
  canvas: modeler.get<Canvas>('canvas'),
  eventBus: modeler.get<EventBus>('eventBus'),
  elementRegistry: modeler.get<ElementRegistry>('elementRegistry'),
  modeling: modeler.get<Modeling>('modeling'),
  elementFactory: modeler.get<ElementFactory>('elementFactory'),
  bpmnReplace: modeler.get<BpmnReplace>('bpmnReplace'),
  selection: modeler.get<Selection>('selection'),
  copyPaste: modeler.get<CopyPaste>('copyPaste'),
  commandStack: modeler.get<CommandStack>('commandStack'),
  toolManager: modeler.get<ToolManager>('toolManager'),
  handTool: modeler.get<HandTool>('handTool'),
  lassoTool: modeler.get<LassoTool>('lassoTool'),
  spaceTool: modeler.get<SpaceTool>('spaceTool'),
  globalConnect: modeler.get<GlobalConnect>('globalConnect'),
});

/** Resolves a click target to the element the user actually means. */
export const toDiagramElement = (
  element: ElementLike | undefined,
): Element | null => {
  if (!element) return null;

  const target = element as Element;

  return target.type === 'label' ? (target.labelTarget ?? null) : target;
};

export const isConnection = (element: { type: string } | null): boolean =>
  !!element && CONNECTION_TYPES.includes(element.type);

export const isShape = (element: { type: string } | null): boolean =>
  !!element && !isConnection(element);

/**
 * Switches the editor to one of the four interaction tools. Mirrors what the
 * built-in palette entries do on click: the tools are driven by their own
 * services, and `toolManager` broadcasts the new active tool on
 * `tool-manager.update`.
 *
 * `event` is only consumed by `globalConnect`, which needs the originating
 * pointer event to seed the drag interaction.
 */
export const activateToolOnModeler = (
  modeler: BpmnModeler,
  tool: EditorToolName,
  event?: Event,
): void => {
  const services = getServices(modeler);

  switch (tool) {
    case 'hand':
      services.handTool.activateHand(event ?? null);
      break;
    case 'lasso':
      services.lassoTool.activateSelection(event as MouseEvent);
      break;
    case 'space':
      services.spaceTool.activateSelection(event as MouseEvent, true, true);
      break;
    case 'global-connect':
      services.globalConnect.start(event, true);
      break;
  }
};

/** Viewport centre in diagram coordinates — where palette drops land. */
const getViewportCenter = (canvas: Canvas): { x: number; y: number } => {
  const { x, y, width, height } = canvas.viewbox();

  return { x: x + width / 2, y: y + height / 2 };
};

/** Top-left corner in diagram coordinates, falling back to the first waypoint. */
const getElementOrigin = (element: Element): { x: number; y: number } => {
  const shape = element as Partial<Shape>;

  if (typeof shape.x === 'number' && typeof shape.y === 'number') {
    return { x: shape.x, y: shape.y };
  }

  const [first] = element.waypoints ?? [];

  return first ? { x: first.x, y: first.y } : { x: 0, y: 0 };
};

/**
 * Expanded containers (participants, lanes, expanded sub-processes) accept
 * children; plain tasks do not, so new elements land in the topmost one.
 */
const getSpawnTarget = (services: EditorServices): Parent => {
  const root = services.canvas.getRootElement() as Parent;

  const containers = services.elementRegistry
    .filter((element) => {
      if (element.parent !== root || element.type === 'label') return false;

      const di = (element as Element).di as
        | { isExpanded?: boolean }
        | undefined;

      return di?.isExpanded === true;
    })
    .sort((a, b) => a.y - b.y) as unknown as Element[];

  return (containers[0] as Parent | undefined) ?? root;
};

export interface SpawnOptions {
  /** Diagram coordinates to drop at. Defaults to the viewport centre. */
  position?: { x: number; y: number };
  name?: string;
}

export const spawnElement = (
  modeler: BpmnModeler,
  element: PaletteElement,
  options: SpawnOptions = {},
): Shape | null => {
  const services = getServices(modeler);
  const position = options.position ?? getViewportCenter(services.canvas);
  const target = getSpawnTarget(services);

  const shape = services.elementFactory.create('shape', {
    type: element.bpmnType,
    ...element.attrs,
    ...(element.eventDefinitionType
      ? { eventDefinitionType: element.eventDefinitionType }
      : {}),
    ...(options.name ? { name: options.name } : {}),
  });

  const created = services.modeling.createShape(shape, position, target);

  services.selection.select(created);
  services.canvas.scrollToElement(created);

  return created;
};

export const connectElements = (
  modeler: BpmnModeler,
  source: Element,
  target: Element,
  type = 'bpmn:SequenceFlow',
): Element | null => {
  const services = getServices(modeler);

  try {
    const connection = services.modeling.connect(source, target, { type });

    services.selection.select(connection);

    return connection;
  } catch {
    return null;
  }
};

export const duplicateElement = (
  modeler: BpmnModeler,
  element: Element,
): Element | null => {
  const services = getServices(modeler);
  const origin = getElementOrigin(element);

  const parent = (element.parent ??
    services.canvas.getRootElement()) as unknown as ShapeLike;

  try {
    const [clone] =
      services.copyPaste.duplicate([element as unknown as ElementLike], {
        element: parent,
        point: { x: origin.x + 48, y: origin.y + 48 },
      }) ?? [];

    if (clone) services.selection.select(clone);

    return (clone as Element | undefined) ?? null;
  } catch {
    return null;
  }
};

export const removeElement = (modeler: BpmnModeler, element: Element): void => {
  getServices(modeler).modeling.removeElements([element]);
};

export const updateProperties = (
  modeler: BpmnModeler,
  element: Element,
  properties: object,
): void => {
  getServices(modeler).modeling.updateProperties(element, properties);
};

export const replaceElementType = (
  modeler: BpmnModeler,
  element: Element,
  target: PaletteElement,
): Element | null => {
  const services = getServices(modeler);

  try {
    const replaced = services.bpmnReplace.replaceElement(element, {
      type: target.bpmnType,
    } as TargetElement);

    services.selection.select(replaced);

    return replaced;
  } catch {
    return null;
  }
};

export const clearSelection = (modeler: BpmnModeler): void => {
  getServices(modeler).selection.select(null);
};

export const zoomToFit = (modeler: BpmnModeler): void => {
  getServices(modeler).canvas.zoom('fit-viewport');
};

export const exportXml = async (
  modeler: BpmnModeler,
): Promise<{ xml: string; error?: string }> => {
  try {
    const { xml } = await modeler.saveXML({ format: true });

    return { xml: xml ?? '' };
  } catch (error) {
    return { xml: '', error: getErrorMessage(error) };
  }
};

export const importXml = async (
  modeler: BpmnModeler,
  xml: string,
): Promise<{ warnings: string[]; error?: string }> => {
  try {
    const { warnings } = await modeler.importXML(xml);

    zoomToFit(modeler);

    return { warnings };
  } catch (error) {
    return { warnings: [], error: getErrorMessage(error) };
  }
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
