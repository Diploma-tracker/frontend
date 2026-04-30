import { readFileSync } from "node:fs";
import { glob } from "glob";
import type { KeyExtractionRule } from "../rules/rule.interface.js";

export interface KeyExtractorOptions {
  dir: string;
  include: string[];
  rules: KeyExtractionRule[];
}

export async function extractUsedKeys(
  options: KeyExtractorOptions,
): Promise<Set<string>> {
  const { dir, include, rules } = options;

  const patterns = include.map((p) => `${dir}/${p}`);
  const files = await glob(patterns, { absolute: true, nodir: true });

  const usedKeys = new Set<string>();

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf-8");
    for (const rule of rules) {
      const keys = rule.extract(content, filePath);
      for (const k of keys) usedKeys.add(k);
    }
  }

  return usedKeys;
}
