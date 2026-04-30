import type { KeyExtractionRule } from "./rule.interface.js";

/**
 * Extracts keys from JSX <T k="some.key" /> components.
 * Matches both single and double quotes.
 *
 * Configurable component names (default: ['T']).
 */
export function createTComponentRule(
  componentNames: string[] = ["T"],
): KeyExtractionRule {
  const namesPattern = componentNames.map((n) => escapeRegex(n)).join("|");
  // Matches: <T k="some.key" /> or <T k='some.key' />
  const regex = new RegExp(
    `<(?:${namesPattern})\\s[^>]*k=['"]([^'"]+)['"]`,
    "g",
  );

  return {
    name: "t-component",
    extract(content: string): string[] {
      const keys: string[] = [];
      let match: RegExpExecArray | null;
      regex.lastIndex = 0;
      while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
      }
      return keys;
    },
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
