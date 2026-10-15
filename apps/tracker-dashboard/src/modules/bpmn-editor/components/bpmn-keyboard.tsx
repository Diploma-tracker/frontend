import { useEffect } from 'react';

import { reatomComponent } from '@reatom/react';
import type BpmnModeler from 'bpmn-js/lib/Modeler';

import { clearSelection, getServices } from '../model/diagram-api';
import {
  duplicateSelected,
  fitViewport,
  getModeler,
  isReadyAtom,
  setSelectedElement,
  setTool,
  toggleCommandPalette,
} from '../model/editor-model';

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
};

/** Menus, dialogs and popovers (e.g. the command palette, Radix poppers) own their keys. */
const isOverlayTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  return !!target.closest(
    '[data-radix-popper-content-wrapper], [role="dialog"], [role="menu"], [role="listbox"]',
  );
};

const shouldIgnoreKey = (event: KeyboardEvent): boolean =>
  isEditableTarget(event.target) || isOverlayTarget(event.target);

/** Ctrl/Cmd+K and Ctrl/Cmd+F both toggle the command palette. */
const isPaletteShortcut = (event: KeyboardEvent): boolean => {
  if (!(event.metaKey || event.ctrlKey)) return false;

  const key = event.key.toLowerCase();

  return key === 'k' || key === 'f';
};

/** Shortcuts the editor adds on top of bpmn-js's own bindings. */
const handleEditorShortcut = (
  modeler: BpmnModeler,
  event: KeyboardEvent,
): boolean => {
  const meta = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  if (event.key === 'Escape') {
    clearSelection(modeler);
    setSelectedElement(null);
    setTool();

    return true;
  }

  if (meta && key === 'd') {
    event.preventDefault();
    duplicateSelected();

    return true;
  }

  if (meta && event.key === '0') {
    event.preventDefault();
    fitViewport();

    return true;
  }

  return false;
};

/**
 * Owns every editor shortcut. bpmn-js binds its key handling to the canvas SVG,
 * so its shortcuts only fire while that element has DOM focus; detaching it
 * (`keyboard.unbind`) and re-dispatching key events through the event bus lets
 * the keys work from anywhere on the editor page — the canvas, the toolbars and
 * the app sidebar alike. That is why nothing here chases DOM focus.
 */
export const BpmnKeyboard = reatomComponent(function BpmnKeyboard() {
  const isReady = isReadyAtom();

  useEffect(() => {
    const modeler = getModeler();

    if (!isReady || !modeler) return;

    getServices(modeler).keyboard.unbind();
  }, [isReady]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // The palette shortcuts work anywhere on the page, including its own input.
      if (isPaletteShortcut(event)) {
        event.preventDefault();
        toggleCommandPalette();

        return;
      }

      const modeler = getModeler();

      if (!modeler || shouldIgnoreKey(event)) return;

      if (handleEditorShortcut(modeler, event)) return;

      if (
        getServices(modeler).eventBus.fire('keyboard.keydown', {
          keyEvent: event,
        })
      ) {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const modeler = getModeler();

      if (!modeler || shouldIgnoreKey(event)) return;

      getServices(modeler).eventBus.fire('keyboard.keyup', { keyEvent: event });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
});
