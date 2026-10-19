import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory';
import type ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import type BpmnReplace from 'bpmn-js/lib/features/replace/BpmnReplace';
import type { TargetElement } from 'bpmn-js/lib/features/replace/BpmnReplace';
import type { Element, Parent, Shape } from 'bpmn-js/lib/model/Types';
import type CommandStack from 'diagram-js/lib/command/CommandStack';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type { CanvasViewbox } from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type EventBus from 'diagram-js/lib/core/EventBus';
import type { Event as EventBusEvent } from 'diagram-js/lib/core/EventBus';
import type CopyPaste from 'diagram-js/lib/features/copy-paste/CopyPaste';
import type GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect';
import type HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
import type Keyboard from 'diagram-js/lib/features/keyboard/Keyboard';
import type LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
import type Selection from 'diagram-js/lib/features/selection/Selection';
import type SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';
import type ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager';
import type { ElementLike, ShapeLike } from 'diagram-js/lib/model/Types';

import {
  STAGE_ATTR,
  STAGE_ORDER_ATTR,
  type StageAttributes,
  isStageElement,
  orderStages,
  parseStageAttributes,
  parseStageOrder,
  serializeStageAttributes,
  serializeStageOrder,
} from './definitions/stage-definitions';
import type { EditorToolName, PaletteElement } from './element-types';

/** BPMN types that only make sense as a connection. */
const CONNECTION_TYPES: string[] = [
  'bpmn:SequenceFlow',
  'bpmn:MessageFlow',
  'bpmn:Association',
  'bpmn:DataAssociation',
];

const getModelerFaced = (modeler: BpmnModeler) => ({
  canvas: modeler.get<Canvas>('canvas'),
  eventBus: modeler.get<EventBus>('eventBus'),
  elementRegistry: modeler.get<ElementRegistry>('elementRegistry'),
  modeling: modeler.get<Modeling>('modeling'),
  elementFactory: modeler.get<ElementFactory>('elementFactory'),
  bpmnFactory: modeler.get<BpmnFactory>('bpmnFactory'),
  bpmnReplace: modeler.get<BpmnReplace>('bpmnReplace'),
  selection: modeler.get<Selection>('selection'),
  copyPaste: modeler.get<CopyPaste>('copyPaste'),
  commandStack: modeler.get<CommandStack>('commandStack'),
  keyboard: modeler.get<Keyboard>('keyboard'),
  toolManager: modeler.get<ToolManager>('toolManager'),
  handTool: modeler.get<HandTool>('handTool'),
  lassoTool: modeler.get<LassoTool>('lassoTool'),
  spaceTool: modeler.get<SpaceTool>('spaceTool'),
  globalConnect: modeler.get<GlobalConnect>('globalConnect'),
  export: async () => {
    const { xml, error } = await modeler.saveXML({ format: true });
    if (!xml) {
      throw new Error('BPMN export failed', { cause: error });
    }
    return xml;
  },
  import: (xml: string) => modeler.importXML(xml),
});
type ModelerFaced = ReturnType<typeof getModelerFaced>;

/** Resolves a click target to the element the user actually means. */
export const toDiagramElement = (
  element: ElementLike | undefined,
): Element | null => {
  if (!element) return null;

  const target = element as Element;

  return target.type === 'label' ? (target.labelTarget ?? null) : target;
};

/** True when a BPMN type is a connection (a flow or an association). */
export const isConnectionType = (type: string): boolean =>
  CONNECTION_TYPES.includes(type);

export const isConnection = (element: { type: string } | null): boolean =>
  !!element && isConnectionType(element.type);

export const isShape = (element: { type: string } | null): boolean =>
  !!element && !isConnection(element);

/** Reads the stage attributes off an element, or `null` when it is not a stage. */
export const readStageAttributes = (element: Element): StageAttributes | null =>
  parseStageAttributes(readAttribute(element, STAGE_ATTR));

/** `source` only exists on connections, so it is unwrapped structurally. */
export const getFlowSource = (flow: Element): Element | undefined =>
  (flow as { source?: Element }).source;

/** True when `flow` is the `default` outgoing flow of `source`. */
export const isDefaultFlowOf = (
  source: Element | undefined,
  flow: Element,
): boolean =>
  !!source && source.businessObject?.default === flow.businessObject;

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
const getSpawnTarget = (services: ModelerFaced): Parent => {
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

/**
 * Attributes `elementFactory` only understands as diagram/DI flags. Everything
 * else in `PaletteElement.attrs` is a business-object property (e.g. the custom
 * `taskDefinitionKey`) and has to be applied through `modeling`.
 */
const DIAGRAM_ATTRIBUTE_KEYS = new Set(['isExpanded', 'isHorizontal']);

const splitElementAttributes = (
  attrs: Record<string, unknown> | undefined,
): { diagram: Record<string, unknown>; business: Record<string, unknown> } => {
  const diagram: Record<string, unknown> = {};
  const business: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (DIAGRAM_ATTRIBUTE_KEYS.has(key)) {
      diagram[key] = value;
    } else {
      business[key] = value;
    }
  }

  return { diagram, business };
};

/** Reads a string custom attribute off an element's business object. */
export const readAttribute = (
  element: Element,
  name: string,
): string | null => {
  const value = element.businessObject?.get(name);

  return typeof value === 'string' && value.length > 0 ? value : null;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * The adapter between our model and a single `bpmn-js` instance. Owns the raw
 * diagram-js services so no caller has to thread the modeler through the app;
 * one instance is created per modeler (see `setModeler` in the editor model)
 * and every diagram operation goes through it.
 */
export class DiagramService {
  private readonly faced: ModelerFaced;

  constructor(modeler: BpmnModeler) {
    this.faced = getModelerFaced(modeler);
  }

  /**
   * Switches the editor to one of the four interaction tools. Mirrors what the
   * built-in palette entries do on click: the tools are driven by their own
   * services, and `toolManager` broadcasts the new active tool on
   * `tool-manager.update`.
   *
   * `event` is only consumed by `globalConnect`, which needs the originating
   * pointer event to seed the drag interaction.
   */
  activateTool(tool: EditorToolName, event?: Event): void {
    switch (tool) {
      case 'hand':
        this.faced.handTool.activateHand(event ?? null);
        break;
      case 'lasso':
        this.faced.lassoTool.activateSelection(event as MouseEvent);
        break;
      case 'space':
        this.faced.spaceTool.activateSelection(event as MouseEvent, true, true);
        break;
      case 'global-connect':
        this.faced.globalConnect.start(event, true);
        break;
    }
  }

  /** Returns the canvas to the default pointer interaction. */
  deactivateTool(): void {
    this.faced.toolManager.setActive(null);
  }

  clearSelection(): void {
    this.faced.selection.select(null);
  }

  selectElement(element: Element): void {
    this.faced.selection.select(element);
  }

  getElementById(id: string): Element | null {
    return toDiagramElement(this.faced.elementRegistry.get(id));
  }

  getAllElements(): Element[] {
    return this.faced.elementRegistry.getAll() as Element[];
  }

  undo(): void {
    this.faced.commandStack.undo();
  }

  redo(): void {
    this.faced.commandStack.redo();
  }

  canUndo(): boolean {
    return this.faced.commandStack.canUndo();
  }

  canRedo(): boolean {
    return this.faced.commandStack.canRedo();
  }

  focusCanvas(): void {
    this.faced.canvas.focus();
  }

  /** Selects an element and scrolls it into view. */
  revealElement(element: Element, padding?: number): void {
    this.faced.selection.select(element);
    this.faced.canvas.scrollToElement(element, padding);
  }

  getViewbox(): CanvasViewbox {
    return this.faced.canvas.viewbox();
  }

  /** Re-measures the canvas after its DOM container resized. */
  resize(): void {
    this.faced.canvas.resized();
  }

  getCanvasSize(): { width: number; height: number } {
    return this.faced.canvas.getSize();
  }

  getZoom(): number {
    return this.faced.canvas.zoom();
  }

  zoomTo(scale: number): void {
    this.faced.canvas.zoom(scale);
  }

  zoomToFit(): void {
    this.faced.canvas.zoom('fit-viewport');
  }

  /** Fires on every pan/zoom; returns an unsubscriber. */
  onViewboxChanged(
    handler: (viewbox: { x: number; y: number; scale: number }) => void,
  ): () => void {
    const listener = (event: EventBusEvent) =>
      handler(
        (
          event as EventBusEvent & {
            viewbox: { x: number; y: number; scale: number };
          }
        ).viewbox,
      );

    this.faced.eventBus.on('canvas.viewbox.changed', listener);

    return () => this.faced.eventBus.off('canvas.viewbox.changed', listener);
  }

  /** Fires when the active tool changes; returns an unsubscriber. */
  onToolChanged(handler: (tool: string | null) => void): () => void {
    const listener = (event: EventBusEvent) =>
      handler((event as EventBusEvent & { tool?: string | null }).tool ?? null);

    this.faced.eventBus.on('tool-manager.update', listener);

    return () => this.faced.eventBus.off('tool-manager.update', listener);
  }

  /** Fires when an XML import finished; returns an unsubscriber. */
  onImportDone(handler: () => void): () => void {
    this.faced.eventBus.on('import.done', handler);

    return () => this.faced.eventBus.off('import.done', handler);
  }

  /** Fires when the selection changed; returns an unsubscriber. */
  onSelectionChanged(handler: (elements: Element[]) => void): () => void {
    const listener = (event: EventBusEvent) =>
      handler(
        (event as EventBusEvent & { newSelection: Element[] }).newSelection,
      );

    this.faced.eventBus.on('selection.changed', listener);

    return () => this.faced.eventBus.off('selection.changed', listener);
  }

  /**
   * Fires on every diagram change (create, remove, move, replace, undo, redo);
   * returns an unsubscriber.
   */
  onDiagramChanged(handler: () => void): () => void {
    this.faced.eventBus.on('commandStack.changed', handler);

    return () => this.faced.eventBus.off('commandStack.changed', handler);
  }

  /**
   * Detaches bpmn-js's own keyboard from the canvas SVG so shortcuts can be
   * re-dispatched from anywhere on the page (see `BpmnKeyboard`).
   */
  unbindKeyboard(): void {
    this.faced.keyboard.unbind();
  }

  /** Routes a keydown through bpmn-js's keyboard handlers. */
  triggerKeydown(event: KeyboardEvent): boolean {
    return Boolean(
      this.faced.eventBus.fire('keyboard.keydown', { keyEvent: event }),
    );
  }

  /** Routes a keyup through bpmn-js's keyboard handlers. */
  triggerKeyup(event: KeyboardEvent): void {
    this.faced.eventBus.fire('keyboard.keyup', { keyEvent: event });
  }

  spawnElement(
    element: PaletteElement,
    options: SpawnOptions = {},
  ): Shape | null {
    const position = options.position ?? getViewportCenter(this.faced.canvas);
    const target = getSpawnTarget(this.faced);

    const { diagram, business } = splitElementAttributes(element.attrs);

    const shape = this.faced.elementFactory.create('shape', {
      type: element.bpmnType,
      ...diagram,
      ...(element.eventDefinitionType
        ? { eventDefinitionType: element.eventDefinitionType }
        : {}),
    });

    const created = this.faced.modeling.createShape(shape, position, target);

    // `elementFactory` drops unknown attrs onto the diagram element instead of
    // the business object, so the custom task discriminator (and name) are
    // applied explicitly — otherwise a palette task behaves nothing like one
    // imported from the starter diagram.
    const properties: Record<string, unknown> = { ...business };

    if (options.name) properties.name = options.name;

    if (Object.keys(properties).length > 0) {
      this.faced.modeling.updateProperties(created, properties);
    }

    this.faced.selection.select(created);
    this.faced.canvas.scrollToElement(created);

    return created;
  }

  connectElements(
    source: Element,
    target: Element,
    type = 'bpmn:SequenceFlow',
  ): Element | null {
    try {
      const connection = this.faced.modeling.connect(source, target, { type });

      this.faced.selection.select(connection);

      return connection;
    } catch {
      return null;
    }
  }

  duplicateElement(element: Element): Element | null {
    const origin = getElementOrigin(element);

    const parent = (element.parent ??
      this.faced.canvas.getRootElement()) as unknown as ShapeLike;

    try {
      const [clone] =
        this.faced.copyPaste.duplicate([element as unknown as ElementLike], {
          element: parent,
          point: { x: origin.x + 48, y: origin.y + 48 },
        }) ?? [];

      if (clone) this.faced.selection.select(clone);

      return (clone as Element | undefined) ?? null;
    } catch {
      return null;
    }
  }

  removeElement(element: Element): void {
    this.faced.modeling.removeElements([element]);
  }

  updateProperties(element: Element, properties: object): void {
    this.faced.modeling.updateProperties(element, properties);
  }

  /**
   * The diagram root as an updatable element. Its business object is the
   * `bpmn:Process`, which holds the stage order.
   */
  private getProcessElement(): Element {
    return this.faced.canvas.getRootElement() as unknown as Element;
  }

  /** Persisted stage order, or an empty list when unset/invalid. */
  readStageOrder(): string[] {
    return parseStageOrder(
      readAttribute(this.getProcessElement(), STAGE_ORDER_ATTR),
    );
  }

  /** Writes the stage order; an empty list clears the attribute. */
  writeStageOrder(ids: string[]): void {
    this.faced.modeling.updateProperties(this.getProcessElement(), {
      [STAGE_ORDER_ATTR]:
        ids.length === 0 ? undefined : serializeStageOrder(ids),
    });
  }

  /**
   * Reconciles the persisted `stageOrder` with the stages currently in the
   * diagram, writing it back when it drifted — a stage was added or removed, or
   * the diagram was imported without one — so the attribute always lists every
   * stage. Returns the authoritative order.
   *
   * The write goes straight onto the business object rather than through
   * `modeling`: `stageOrder` is derived from the diagram, so normalising it must
   * not add an undo step or mark a drag as dirty. It still lands in the exported
   * XML on the next save.
   */
  syncStageOrder(): string[] {
    const present = this.readStageSubProcesses().map((element) => element.id);
    const persisted = this.readStageOrder();
    const normalized = orderStages(present, persisted);

    const drifted =
      normalized.length !== persisted.length ||
      normalized.some((id, index) => id !== persisted[index]);

    if (drifted) {
      this.getProcessElement().businessObject?.set(
        STAGE_ORDER_ATTR,
        normalized.length === 0 ? undefined : serializeStageOrder(normalized),
      );
    }

    return normalized;
  }

  /** Every subprocess flagged as a stage, in diagram order. */
  readStageSubProcesses(): Element[] {
    return this.getAllElements().filter((element) => isStageElement(element));
  }

  /**
   * Writes (or clears) the stage attributes of a subprocess. Clearing removes
   * the attribute entirely, so the subprocess stops being a stage.
   */
  writeStageAttributes(element: Element, info: StageAttributes | null): void {
    this.faced.modeling.updateProperties(element, {
      [STAGE_ATTR]: info === null ? undefined : serializeStageAttributes(info),
    });
  }

  /**
   * Writes (or clears) the condition expression of a sequence flow. A flow that
   * carries a condition cannot be a gateway's default, so callers resolve one
   * before setting the other.
   */
  setConditionExpression(flow: Element, body: string | null): void {
    const trimmed = body?.trim() ?? '';

    const bo = flow.businessObject as {
      eventDefinitions?: Array<{
        $type: string;
        condition?: unknown;
      }>;
    };
    const eventDefs = Array.isArray(bo?.eventDefinitions)
      ? (bo.eventDefinitions as Array<{
          $type: string;
          condition?: unknown;
        }>)
      : [];

    const hasConditional = eventDefs.some(
      (def) => def.$type === 'bpmn:ConditionalEventDefinition',
    );

    if (hasConditional) {
      this.faced.modeling.updateProperties(flow, {
        eventDefinitions: eventDefs.map((def) => {
          if (def.$type === 'bpmn:ConditionalEventDefinition') {
            return this.faced.bpmnFactory.create(
              'bpmn:ConditionalEventDefinition',
              {
                condition:
                  trimmed.length === 0
                    ? undefined
                    : this.faced.bpmnFactory.create('bpmn:FormalExpression', {
                        body: trimmed,
                      }),
              },
            );
          }

          return def;
        }),
      });

      return;
    }

    this.faced.modeling.updateProperties(flow, {
      conditionExpression:
        trimmed.length === 0
          ? undefined
          : this.faced.bpmnFactory.create('bpmn:FormalExpression', {
              body: trimmed,
            }),
    });
  }

  /** Sets (or clears) the gateway's `default` outgoing flow. */
  setDefaultFlow(gateway: Element, flow: Element | null): void {
    this.faced.modeling.updateProperties(gateway, {
      default: flow ?? undefined,
    });
  }

  /**
   * Switches an event's attached definition (or drops it for a plain event).
   * `bpmnReplace` keeps the element's name and attachment, converts it to
   * `elementType`, and rebuilds the `eventDefinitions` list from the definition.
   * `elementType` lets an intermediate event switch between catch and throw; it
   * defaults to keeping the current type.
   */
  setEventDefinitionType(
    element: Element,
    eventDefinitionType: string | null,
    elementType: string = element.type,
  ): Element | null {
    try {
      const replaced = this.faced.bpmnReplace.replaceElement(element, {
        type: elementType,
        ...(eventDefinitionType ? { eventDefinitionType } : {}),
      } as TargetElement);

      this.faced.selection.select(replaced);

      return replaced;
    } catch {
      return null;
    }
  }

  /**
   * Switches a gateway to another gateway type. `bpmnReplace` keeps the element's
   * id, position and connections, and rebuilds the shape for the new type.
   */
  setGatewayType(element: Element, gatewayType: string): Element | null {
    try {
      const replaced = this.faced.bpmnReplace.replaceElement(element, {
        type: gatewayType,
      } as TargetElement);

      this.faced.selection.select(replaced);

      return replaced;
    } catch {
      return null;
    }
  }

  /** Toggles a boundary event between interrupting and non-interrupting. */
  setBoundaryInterrupting(element: Element, interrupting: boolean): void {
    this.faced.modeling.updateProperties(element, {
      cancelActivity: interrupting,
    });
  }

  /** Sets a timer event's value into the given `bpmn:TimerEventDefinition` field. */
  setTimerDefinition(element: Element, property: string, value: string): void {
    const trimmed = value.trim();

    const timerDefinition = this.faced.bpmnFactory.create(
      'bpmn:TimerEventDefinition',
      {
        [property]:
          trimmed.length === 0
            ? undefined
            : this.faced.bpmnFactory.create('bpmn:FormalExpression', {
                body: trimmed,
              }),
      },
    );

    this.faced.modeling.updateProperties(element, {
      eventDefinitions: [timerDefinition],
    });
  }

  async exportXml(): Promise<{ xml: string; error?: string }> {
    try {
      return { xml: await this.faced.export() };
    } catch (error) {
      return { xml: '', error: getErrorMessage(error) };
    }
  }

  async importXml(
    xml: string,
  ): Promise<{ warnings: string[]; error?: string }> {
    try {
      const { warnings } = await this.faced.import(xml);

      this.zoomToFit();

      return { warnings };
    } catch (error) {
      return { warnings: [], error: getErrorMessage(error) };
    }
  }
}
