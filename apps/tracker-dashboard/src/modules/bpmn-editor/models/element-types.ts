import type { ComponentType } from 'react';

import type { Icon } from '@phosphor-icons/react';

/**
 * Custom BPMN notation glyphs drawn as plain SVG in `features/palette-icons`.
 * The type lives here so catalog types never reach up into `features/`.
 */
export type PaletteIcon = ComponentType<{ className?: string }>;

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

export type CreateGroupId = 'flow' | 'activity' | 'annotation';

export interface PaletteElement {
  id: string;
  /** Concrete BPMN type handed to `bpmnFactory` / `elementFactory`. */
  bpmnType: string;
  group: CreateGroupId;
  labelKey: string;
  descriptionKey: string;
  icon: PaletteIcon;
  /** Extra attributes passed to `elementFactory.createShape`. */
  attrs?: Record<string, unknown>;
  /** Attached event definition, e.g. `bpmn:MessageEventDefinition`. */
  eventDefinitionType?: string;
}

export interface CreateGroup {
  id: CreateGroupId;
  labelKey: string;
}
