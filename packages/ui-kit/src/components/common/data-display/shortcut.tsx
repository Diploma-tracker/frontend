import { Fragment } from 'react';

import { Kbd, KbdGroup } from './kbd';

const isApplePlatform = (): boolean =>
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

type Modifier = 'ctrl' | 'alt' | 'shift' | 'mod';

/** Canonical display order: `⌃⌥⇧⌘` on Apple, `Ctrl+Alt+Shift` elsewhere. */
const MODIFIER_ORDER: readonly Modifier[] = ['ctrl', 'alt', 'shift', 'mod'];

const MODIFIER_ALIASES: Record<string, Modifier> = {
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
  mod: 'mod',
  meta: 'mod',
  cmd: 'mod',
  command: 'mod',
  super: 'mod',
  win: 'mod',
};

const APPLE_MODIFIER_LABELS: Record<Modifier, string> = {
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  mod: '⌘',
};

const DEFAULT_MODIFIER_LABELS: Record<Modifier, string> = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  mod: 'Ctrl',
};

const KEY_LABELS: Record<string, string> = {
  enter: '↵',
  return: '↵',
  escape: 'Esc',
  esc: 'Esc',
  space: 'Space',
  spacebar: 'Space',
  tab: '⇥',
  backspace: '⌫',
  delete: 'Del',
  deleteforward: 'Del',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
};

const formatKey = (key: string): string => {
  const label = KEY_LABELS[key.toLowerCase()];

  if (label) return label;
  if (key.length === 1) return key.toUpperCase();

  return key.charAt(0).toUpperCase() + key.slice(1);
};

/**
 * Turns a keybind string (`"Mod+Shift+K"`, `"H"`) into the ordered labels to
 * display: modifiers first in canonical order, then the main key. `Mod` maps to
 * ⌘ on Apple platforms and to Ctrl everywhere else, matching bindings written
 * against `metaKey || ctrlKey`.
 */
export const formatShortcut = (keys: string): string[] => {
  const labels = isApplePlatform()
    ? APPLE_MODIFIER_LABELS
    : DEFAULT_MODIFIER_LABELS;
  const modifiers = new Set<Modifier>();
  let mainKey: string | null = null;

  for (const part of keys.split('+')) {
    const token = part.trim();

    if (!token) continue;

    const modifier = MODIFIER_ALIASES[token.toLowerCase()];

    if (modifier) modifiers.add(modifier);
    else mainKey = formatKey(token);
  }

  const orderedModifiers = MODIFIER_ORDER.filter((modifier) =>
    modifiers.has(modifier),
  ).map((modifier) => labels[modifier]);

  return mainKey ? [...orderedModifiers, mainKey] : orderedModifiers;
};

interface ShortcutProps extends Omit<React.ComponentProps<'kbd'>, 'children'> {
  /** Keybind to display, e.g. `"Mod+K"` or a single key like `"H"`. */
  keys: string;
}

/**
 * Renders a keybind as keycaps joined with `+`. Modifiers are resolved for the
 * current platform, so callers pass the binding itself rather than platform
 * labels.
 */
function Shortcut({ keys, className, ...props }: ShortcutProps) {
  const tokens = formatShortcut(keys);

  if (tokens.length === 0) return null;

  if (tokens.length === 1) {
    return (
      <Kbd className={className} {...props}>
        {tokens[0]}
      </Kbd>
    );
  }

  return (
    <KbdGroup className={className} {...props}>
      {tokens.map((token, index) => (
        <Fragment key={token}>
          {index > 0 && '+'}
          <Kbd>{token}</Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  );
}

export { Shortcut };
