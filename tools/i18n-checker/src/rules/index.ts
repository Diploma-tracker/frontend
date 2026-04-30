import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import type { KeyExtractionRule } from "./rule.interface.js";
import { createTFunctionRule } from "./t-function.rule.js";
import { createTComponentRule } from "./t-component.rule.js";

export { createTFunctionRule, createTComponentRule };
export type { KeyExtractionRule };

/**
 * Build the static set of built-in extraction rules.
 * Rules are fixed:
 *   - t('key') / k('key') function calls
 *   - <T k="key" /> JSX components
 *
 * Pass `customRulePaths` only when you need project-specific additions.
 */
export async function buildRules(
  customRulePaths: string[] = [],
): Promise<KeyExtractionRule[]> {
  const rules: KeyExtractionRule[] = [
    createTFunctionRule(["t", "k"]),
    createTComponentRule(),
  ];

  for (const rulePath of customRulePaths) {
    const absPath = resolve(rulePath);
    const url = pathToFileURL(absPath).href;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mod = await import(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const rule = (mod.default ?? mod) as KeyExtractionRule;
    if (typeof rule.extract !== "function") {
      throw new Error(
        `Custom rule at "${rulePath}" does not export a valid KeyExtractionRule`,
      );
    }
    rules.push(rule);
  }

  return rules;
}
