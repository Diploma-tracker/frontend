import { loadLocale, parseLocaleArg } from "../core/locale-loader.js";
import { extractUsedKeys } from "../core/key-extractor.js";
import { buildRules } from "../rules/index.js";

// ---- Input DTO ----

export interface AuditInput {
  /** List of "name=path" locale strings */
  localeArgs: string[];
  /** Root directory to scan */
  dir: string;
  /** Glob patterns for files to include */
  include: string[];
  /** Keys (or glob-style patterns) to exclude from used-key analysis */
  ignore?: string[];
}

// ---- Output DTOs ----

export interface LocaleAuditInfo {
  name: string;
  filePath: string;
  keyCount: number;
}

export interface AuditResult {
  /** Info about each loaded locale */
  locales: LocaleAuditInfo[];
  /** Resolved include patterns used */
  include: string[];
  /** All keys found in source files */
  usedKeys: Set<string>;
  /** Union of all keys defined across all locale files */
  allLocaleKeys: Set<string>;
  /** Keys defined in locale files but never referenced in source */
  deadKeys: Set<string>;
  /** Keys used in source but absent from every locale file */
  missingFromAllLocales: Set<string>;
  /** locale name → keys present elsewhere but missing from this locale */
  localeGaps: Map<string, Set<string>>;
  /** True when there are no dead keys, no missing keys, and no locale gaps */
  isClean: boolean;
}

// ---- Service ----

export async function audit(input: AuditInput): Promise<AuditResult> {
  const include = input.include.length > 0 ? input.include : ["**/*.{ts,tsx}"];
  const ignorePatterns = input.ignore ?? [];

  const rules = await buildRules();
  let usedKeys = await extractUsedKeys({ dir: input.dir, include, rules });

  // Filter out ignored keys (exact match or simple glob: leading/trailing *)
  if (ignorePatterns.length > 0) {
    const filtered = new Set<string>();
    for (const key of usedKeys) {
      if (!ignorePatterns.some((p) => matchIgnorePattern(p, key))) {
        filtered.add(key);
      }
    }
    usedKeys = filtered;
  }

  // Load locales
  const localesInfo: LocaleAuditInfo[] = [];
  const localeKeysMap = new Map<string, Set<string>>();

  for (const arg of input.localeArgs) {
    const { name, filePath } = parseLocaleArg(arg);
    const data = loadLocale(name, filePath);
    const keys = new Set(data.keys.keys());
    localeKeysMap.set(name, keys);
    localesInfo.push({ name, filePath: data.filePath, keyCount: keys.size });
  }

  // Union of all locale keys
  const allLocaleKeys = new Set<string>();
  for (const keys of localeKeysMap.values()) {
    for (const k of keys) allLocaleKeys.add(k);
  }

  // Dead keys: defined in locales but never used in source
  const deadKeys = new Set<string>();
  for (const k of allLocaleKeys) {
    if (!usedKeys.has(k)) deadKeys.add(k);
  }

  // Missing from all locales: used in source but absent everywhere
  const missingFromAllLocales = new Set<string>();
  for (const k of usedKeys) {
    if (!allLocaleKeys.has(k)) missingFromAllLocales.add(k);
  }

  // Locale gaps: key exists in at least one locale but not this one
  const localeGaps = new Map<string, Set<string>>();
  for (const [name, keys] of localeKeysMap) {
    const missing = new Set<string>();
    for (const k of allLocaleKeys) {
      if (!keys.has(k)) missing.add(k);
    }
    localeGaps.set(name, missing);
  }

  const hasGaps = [...localeGaps.values()].some((s) => s.size > 0);
  const isClean =
    deadKeys.size === 0 && missingFromAllLocales.size === 0 && !hasGaps;

  return {
    locales: localesInfo,
    include,
    usedKeys,
    allLocaleKeys,
    deadKeys,
    missingFromAllLocales,
    localeGaps,
    isClean,
  };
}

// ---- Helpers ----

/**
 * Match an ignore pattern against a key.
 * Supports:
 *   - exact match: "draft"
 *   - prefix glob: "foo.*"  (matches "foo.bar", "foo.bar.baz")
 *   - full glob with leading *: "*foo*" → substring match
 */
function matchIgnorePattern(pattern: string, key: string): boolean {
  if (pattern === key) return true;
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    return key === prefix || key.startsWith(prefix + ".");
  }
  if (pattern.startsWith("*") || pattern.endsWith("*")) {
    const regex = new RegExp(
      "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$",
    );
    return regex.test(key);
  }
  return false;
}
