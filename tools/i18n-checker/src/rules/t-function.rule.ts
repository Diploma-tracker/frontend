import type { KeyExtractionRule } from "./rule.interface.js";

/**
 * Extracts keys from calls like:
 *   t('some.key')
 *   t("some.key")
 *   t('some.key', { ... })
 *
 * Configurable function names (default: ['t']).
 * Does NOT handle template literals — those are dynamic and cannot be statically resolved.
 */
export function createTFunctionRule(
  functionNames: string[] = ["t"],
): KeyExtractionRule {
  const fnPattern = functionNames.map((fn) => escapeRegex(fn)).join("|");
  // Matches: t('key') or t("key") with optional second argument
  const regex = new RegExp(`(?:${fnPattern})\\(\\s*['"]([^'"]+)['"]`, "g");

  return {
    name: "t-function",
    extract(content: string): string[] {
      const keys: string[] = [];
      let match: RegExpExecArray | null;
      // Reset lastIndex each call since we reuse the regex
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
