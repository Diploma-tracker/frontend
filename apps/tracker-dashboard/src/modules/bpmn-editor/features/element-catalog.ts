import { k } from '@/shared/utils/i18n';
import {
  CheckSquareIcon,
  CodeIcon,
  DiamondIcon,
  FileTextIcon,
  FlowArrowIcon,
  HandGrabbingIcon,
  RectangleDashedIcon,
  SelectionPlusIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  StackIcon,
  TextTIcon,
} from '@phosphor-icons/react';

import type {
  CreateGroup,
  PaletteElement,
  ToolEntry,
} from '../models/element-types';
import {
  EndEventIcon,
  IntermediateEventIcon,
  PoolIcon,
  StartEventIcon,
} from './palette-icons';

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
    icon: SelectionPlusIcon,
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
  { id: 'flow', labelKey: k('bpmnEditor.palette.groups.flowControl') },
  { id: 'activity', labelKey: k('bpmnEditor.palette.groups.activities') },
  { id: 'annotation', labelKey: k('bpmnEditor.palette.groups.annotation') },
];

export const paletteElements: PaletteElement[] = [
  {
    id: 'start-event',
    bpmnType: 'bpmn:StartEvent',
    group: 'flow',
    labelKey: k('bpmnEditor.palette.startEvent'),
    descriptionKey: k('bpmnEditor.palette.startEventDescription'),
    icon: StartEventIcon,
  },
  {
    id: 'intermediate-event',
    bpmnType: 'bpmn:IntermediateCatchEvent',
    group: 'flow',
    labelKey: k('bpmnEditor.palette.intermediateEvent'),
    descriptionKey: k('bpmnEditor.palette.intermediateEventDescription'),
    icon: IntermediateEventIcon,
  },
  {
    id: 'end-event',
    bpmnType: 'bpmn:EndEvent',
    group: 'flow',
    labelKey: k('bpmnEditor.palette.endEvent'),
    descriptionKey: k('bpmnEditor.palette.endEventDescription'),
    icon: EndEventIcon,
  },
  {
    id: 'gateway',
    bpmnType: 'bpmn:ExclusiveGateway',
    group: 'flow',
    labelKey: k('bpmnEditor.palette.gateway'),
    descriptionKey: k('bpmnEditor.palette.gatewayDescription'),
    icon: DiamondIcon,
  },
  {
    id: 'approve-task',
    bpmnType: 'bpmn:UserTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.approveTask'),
    descriptionKey: k('bpmnEditor.palette.approveTaskDescription'),
    icon: CheckSquareIcon,
    attrs: { taskDefinitionKey: 'approve' },
  },
  {
    id: 'fill-form-task',
    bpmnType: 'bpmn:UserTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.fillFormTask'),
    descriptionKey: k('bpmnEditor.palette.fillFormTaskDescription'),
    icon: FileTextIcon,
    attrs: { taskDefinitionKey: 'fill-project-fields' },
  },
  {
    id: 'register-defense-task',
    bpmnType: 'bpmn:UserTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.registerDefenseTask'),
    descriptionKey: k('bpmnEditor.palette.registerDefenseTaskDescription'),
    icon: ShieldCheckIcon,
    attrs: { taskDefinitionKey: 'register-project-for-defense' },
  },
  {
    id: 'script-task',
    bpmnType: 'bpmn:ScriptTask',
    group: 'activity',
    labelKey: k('bpmnEditor.palette.scriptTask'),
    descriptionKey: k('bpmnEditor.palette.scriptTaskDescription'),
    icon: CodeIcon,
    attrs: { taskDefinitionKey: 'script' },
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
    id: 'text-annotation',
    bpmnType: 'bpmn:TextAnnotation',
    group: 'annotation',
    labelKey: k('bpmnEditor.palette.textAnnotation'),
    descriptionKey: k('bpmnEditor.palette.textAnnotationDescription'),
    icon: TextTIcon,
  },
  {
    id: 'group',
    bpmnType: 'bpmn:Group',
    group: 'annotation',
    labelKey: k('bpmnEditor.palette.group'),
    descriptionKey: k('bpmnEditor.palette.groupDescription'),
    icon: RectangleDashedIcon,
  },
  {
    id: 'participant',
    bpmnType: 'bpmn:Participant',
    group: 'annotation',
    labelKey: k('bpmnEditor.palette.participant'),
    descriptionKey: k('bpmnEditor.palette.participantDescription'),
    icon: PoolIcon,
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
