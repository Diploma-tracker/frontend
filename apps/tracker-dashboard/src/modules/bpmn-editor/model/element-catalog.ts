import { k } from '@/shared/utils/i18n';
import type { Icon } from '@phosphor-icons/react';
import {
  CheckSquareIcon,
  ClockIcon,
  DatabaseIcon,
  DiamondIcon,
  FingerprintIcon,
  FlowArrowIcon,
  FolderIcon,
  GearIcon,
  GitBranchIcon,
  GitMergeIcon,
  HandGrabbingIcon,
  LightningIcon,
  NoteIcon,
  PaperPlaneTiltIcon,
  PlayCircleIcon,
  PlusIcon,
  RectangleIcon,
  SelectionIcon,
  SquaresFourIcon,
  StackIcon,
  StopCircleIcon,
  UserIcon,
} from '@phosphor-icons/react';

/** bpmn-js `tool-manager` tool names, as registered in `ToolManager.registerTool`. */
export type EditorToolName = 'hand' | 'lasso' | 'space' | 'global-connect';

export interface ToolEntry {
  id: string;
  /** Tool name reported by bpmn-js on `tool-manager.update`. */
  tool: EditorToolName;
  labelKey: string;
  descriptionKey: string;
  icon: Icon;
  /**
   * Single-key binding from `SHORTCUTS_KEY_BINDINGS` in
   * `bpmn-js/lib/features/keyboard/BpmnKeyboardBindings.js`. That map is not
   * exported, so the values are mirrored here. Only the four tools have one.
   */
  shortcut?: string;
}

export type CreateGroupId =
  | 'event'
  | 'activity'
  | 'gateway'
  | 'artifact'
  | 'container';

export interface PaletteElement {
  id: string;
  /** Concrete BPMN type handed to `bpmnFactory` / `elementFactory`. */
  bpmnType: string;
  group: CreateGroupId;
  labelKey: string;
  descriptionKey: string;
  icon: Icon;
  /** Extra attributes passed to `elementFactory.createShape`. */
  attrs?: Record<string, unknown>;
  /** Attached event definition, e.g. `bpmn:MessageEventDefinition`. */
  eventDefinitionType?: string;
}

export interface CreateGroup {
  id: CreateGroupId;
  labelKey: string;
}

/**
 * The four interaction tools of the built-in bpmn-js palette, in the same order
 * and with the same bindings the built-in palette uses.
 */
export const toolEntries: ToolEntry[] = [
  {
    id: 'hand-tool',
    tool: 'hand',
    labelKey: k('bpmnEditor.tools.hand.name'),
    descriptionKey: k('bpmnEditor.tools.hand.description'),
    icon: HandGrabbingIcon,
    shortcut: 'H',
  },
  {
    id: 'select-tool',
    tool: 'lasso',
    labelKey: k('bpmnEditor.tools.select.name'),
    descriptionKey: k('bpmnEditor.tools.select.description'),
    icon: SelectionIcon,
    shortcut: 'L',
  },
  {
    id: 'space-tool',
    tool: 'space',
    labelKey: k('bpmnEditor.tools.space.name'),
    descriptionKey: k('bpmnEditor.tools.space.description'),
    icon: SquaresFourIcon,
    shortcut: 'S',
  },
  {
    id: 'global-connect-tool',
    tool: 'global-connect',
    labelKey: k('bpmnEditor.tools.globalConnect.name'),
    descriptionKey: k('bpmnEditor.tools.globalConnect.description'),
    icon: FlowArrowIcon,
    shortcut: 'C',
  },
];

export const createGroups: CreateGroup[] = [
  { id: 'event', labelKey: k('bpmnEditor.palette.groups.events') },
  { id: 'activity', labelKey: k('bpmnEditor.palette.groups.activities') },
  { id: 'gateway', labelKey: k('bpmnEditor.palette.groups.gateways') },
  { id: 'artifact', labelKey: k('bpmnEditor.palette.groups.artifacts') },
  { id: 'container', labelKey: k('bpmnEditor.palette.groups.containers') },
];

// TODO: Replace with a backend request once the real BPMN element catalog is
// available. Canvas code must only depend on the `PaletteElement` contract so
// that swapping the loader is the only change needed.
export const paletteElements: PaletteElement[] = [
  {
    id: 'start-event',
    bpmnType: 'bpmn:StartEvent',
    group: 'event',
    labelKey: k('bpmnEditor.palette.startEvent'),
    descriptionKey: k('bpmnEditor.palette.startEventDescription'),
    icon: PlayCircleIcon,
  },
  {
    id: 'message-intermediate-event',
    bpmnType: 'bpmn:IntermediateCatchEvent',
    group: 'event',
    labelKey: k('bpmnEditor.palette.messageIntermediateEvent'),
    descriptionKey: k('bpmnEditor.palette.messageIntermediateEventDescription'),
    icon: ClockIcon,
    eventDefinitionType: 'bpmn:MessageEventDefinition',
  },
  {
    id: 'signal-intermediate-event',
    bpmnType: 'bpmn:IntermediateThrowEvent',
    group: 'event',
    labelKey: k('bpmnEditor.palette.signalIntermediateEvent'),
    descriptionKey: k('bpmnEditor.palette.signalIntermediateEventDescription'),
    icon: FingerprintIcon,
    eventDefinitionType: 'bpmn:SignalEventDefinition',
  },
  {
    id: 'end-event',
    bpmnType: 'bpmn:EndEvent',
    group: 'event',
    labelKey: k('bpmnEditor.palette.endEvent'),
    descriptionKey: k('bpmnEditor.palette.endEventDescription'),
    icon: StopCircleIcon,
  },
  {
    id: 'message-end-event',
    bpmnType: 'bpmn:EndEvent',
    group: 'event',
    labelKey: k('bpmnEditor.palette.messageEndEvent'),
    descriptionKey: k('bpmnEditor.palette.messageEndEventDescription'),
    icon: StopCircleIcon,
    eventDefinitionType: 'bpmn:MessageEventDefinition',
  },
  {
    id: 'task',
    bpmnType: 'bpmn:Task',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.task'),
    descriptionKey: k('bpmnEditor.palette.taskDescription'),
    icon: CheckSquareIcon,
  },
  {
    id: 'user-task',
    bpmnType: 'bpmn:UserTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.userTask'),
    descriptionKey: k('bpmnEditor.palette.userTaskDescription'),
    icon: UserIcon,
  },
  {
    id: 'service-task',
    bpmnType: 'bpmn:ServiceTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.serviceTask'),
    descriptionKey: k('bpmnEditor.palette.serviceTaskDescription'),
    icon: GearIcon,
  },
  {
    id: 'send-task',
    bpmnType: 'bpmn:SendTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.sendTask'),
    descriptionKey: k('bpmnEditor.palette.sendTaskDescription'),
    icon: PaperPlaneTiltIcon,
  },
  {
    id: 'sub-process',
    bpmnType: 'bpmn:SubProcess',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.subProcess'),
    descriptionKey: k('bpmnEditor.palette.subProcessDescription'),
    icon: StackIcon,
    attrs: { isExpanded: true },
  },
  {
    id: 'ad-hoc-sub-process',
    bpmnType: 'bpmn:AdHocSubProcess',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.adHocSubProcess'),
    descriptionKey: k('bpmnEditor.palette.adHocSubProcessDescription'),
    icon: SquaresFourIcon,
    attrs: { isExpanded: true },
  },
  {
    id: 'exclusive-gateway',
    bpmnType: 'bpmn:ExclusiveGateway',
    group: 'gateway',
    labelKey: k('bpmnEditor.palette.exclusiveGateway'),
    descriptionKey: k('bpmnEditor.palette.exclusiveGatewayDescription'),
    icon: DiamondIcon,
  },
  {
    id: 'parallel-gateway',
    bpmnType: 'bpmn:ParallelGateway',
    group: 'gateway',
    labelKey: k('bpmnEditor.palette.parallelGateway'),
    descriptionKey: k('bpmnEditor.palette.parallelGatewayDescription'),
    icon: GitMergeIcon,
  },
  {
    id: 'inclusive-gateway',
    bpmnType: 'bpmn:InclusiveGateway',
    group: 'gateway',
    labelKey: k('bpmnEditor.palette.inclusiveGateway'),
    descriptionKey: k('bpmnEditor.palette.inclusiveGatewayDescription'),
    icon: GitBranchIcon,
  },
  {
    id: 'event-based-gateway',
    bpmnType: 'bpmn:EventBasedGateway',
    group: 'gateway',
    labelKey: k('bpmnEditor.palette.eventBasedGateway'),
    descriptionKey: k('bpmnEditor.palette.eventBasedGatewayDescription'),
    icon: LightningIcon,
  },
  {
    id: 'data-object',
    bpmnType: 'bpmn:DataObjectReference',
    group: 'artifact',
    labelKey: k('bpmnEditor.palette.dataObject'),
    descriptionKey: k('bpmnEditor.palette.dataObjectDescription'),
    icon: DatabaseIcon,
  },
  {
    id: 'data-store',
    bpmnType: 'bpmn:DataStoreReference',
    group: 'artifact',
    labelKey: k('bpmnEditor.palette.dataStore'),
    descriptionKey: k('bpmnEditor.palette.dataStoreDescription'),
    icon: FolderIcon,
  },
  {
    id: 'text-annotation',
    bpmnType: 'bpmn:TextAnnotation',
    group: 'artifact',
    labelKey: k('bpmnEditor.palette.textAnnotation'),
    descriptionKey: k('bpmnEditor.palette.textAnnotationDescription'),
    icon: NoteIcon,
  },
  {
    id: 'group',
    bpmnType: 'bpmn:Group',
    group: 'artifact',
    labelKey: k('bpmnEditor.palette.group'),
    descriptionKey: k('bpmnEditor.palette.groupDescription'),
    icon: RectangleIcon,
  },
  {
    id: 'participant',
    bpmnType: 'bpmn:Participant',
    group: 'container',
    labelKey: k('bpmnEditor.palette.participant'),
    descriptionKey: k('bpmnEditor.palette.participantDescription'),
    icon: PlusIcon,
    attrs: { isHorizontal: true, isExpanded: true },
  },
];

/** Flattens the create entries into the order the rail renders them in. */
export const createEntries: {
  group: CreateGroup;
  elements: PaletteElement[];
}[] = createGroups.map((group) => ({
  group,
  elements: paletteElements.filter((element) => element.group === group.id),
}));
