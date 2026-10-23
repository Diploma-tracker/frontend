import {
  BpmnKeyboard,
  isActiveAtom,
  isCommandPaletteOpenAtom,
  isReadyAtom,
} from '@/modules/bpmn-editor';
import { act, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

afterEach(() => {
  isActiveAtom.set(false);
  isReadyAtom.set(false);
  isCommandPaletteOpenAtom.set(false);
});

it('only captures editor shortcuts while active, and removes listeners on unmount', async () => {
  isReadyAtom.set(true);
  isActiveAtom.set(false);
  const { unmount } = render(<BpmnKeyboard />);
  const shortcut = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      document.dispatchEvent(event);
    });
    return event;
  };

  expect(shortcut().defaultPrevented).toBe(false);
  expect(isCommandPaletteOpenAtom()).toBe(false);
  await act(async () => {
    isActiveAtom.set(true);
  });
  expect(shortcut().defaultPrevented).toBe(true);
  expect(isCommandPaletteOpenAtom()).toBe(true);
  await act(async () => {
    isActiveAtom.set(false);
  });
  expect(shortcut().defaultPrevented).toBe(false);
  expect(isCommandPaletteOpenAtom()).toBe(true);
  await act(async () => {
    isActiveAtom.set(true);
  });
  unmount();
  expect(shortcut().defaultPrevented).toBe(false);
});
