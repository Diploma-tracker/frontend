import { extractUsedKeys } from "../core/key-extractor.js";
import { buildRules } from "../rules/index.js";
import { LocaleStore } from "./locale-store.service.js";

// ---- Input DTO ----

export interface FixInput {
  /** List of "name=path" locale strings */
  localeArgs: string[];
  /** Root directory to scan for source files */
  dir: string;
  /** Glob patterns for files to include */
  include: string[];
  /**
   * When false (default) no files are modified — dry-run mode.
   * When true the dead keys are removed and locale files are saved.
   */
  write: boolean;
}

// ---- Output DTOs ----

export interface FixedLocaleInfo {
  name: string;
  filePath: string;
  /** Keys removed (or that would be removed) from this locale */
  removedKeys: string[];
}

export interface FixResult {
  /** Resolved include patterns used */
  include: string[];
  /** All keys found in source files */
  usedKeys: Set<string>;
  /** Keys that are in locale files but never used — candidates for removal */
  deadKeys: Set<string>;
  /** Per-locale breakdown of removed keys */
  locales: FixedLocaleInfo[];
  /** Whether files were actually written to disk */
  written: boolean;
}

// ---- Service ----

export async function fix(input: FixInput): Promise<FixResult> {
  const include = input.include.length > 0 ? input.include : ["**/*.{ts,tsx}"];

  const rules = await buildRules();
  const usedKeys = await extractUsedKeys({ dir: input.dir, include, rules });

  const store = LocaleStore.fromArgs(input.localeArgs);

  // Dead keys: present in any locale but never referenced in source
  const allLocaleKeys = new Set(store.getAllKeys());
  const deadKeys = new Set<string>();
  for (const k of allLocaleKeys) {
    if (!usedKeys.has(k)) deadKeys.add(k);
  }

  // Per-locale breakdown: which dead keys actually exist in each locale
  const localeInfos: FixedLocaleInfo[] = store
    .getAll()
    .map(({ name, filePath, keys }) => {
      const localeKeySet = new Set(keys.map((e) => e.key));
      const removedKeys = [...deadKeys]
        .filter((k) => localeKeySet.has(k))
        .sort();
      return { name, filePath, removedKeys };
    });

  if (input.write && deadKeys.size > 0) {
    store.remove("*", [...deadKeys]);
    store.saveAll();
  }

  return {
    include,
    usedKeys,
    deadKeys,
    locales: localeInfos,
    written: input.write && deadKeys.size > 0,
  };
}
