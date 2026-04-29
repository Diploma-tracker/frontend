import { loadLocale, parseLocaleArg } from "../core/locale-loader.js";
import { compareLocales } from "../core/diff.js";

// ---- Input DTO ----

export interface CheckLocalesInput {
  /** List of "name=path" locale strings */
  localeArgs: string[];
}

// ---- Output DTOs ----

export interface LocaleInfo {
  name: string;
  filePath: string;
  keyCount: number;
}

export interface CheckLocalesResult {
  locales: LocaleInfo[];
  /** Union of all keys across every locale */
  unionKeys: Set<string>;
  /** Keys present in every locale */
  allKeys: Set<string>;
  /** locale name → keys missing from that locale */
  missingPerLocale: Map<string, Set<string>>;
  /** True when every locale has exactly the same keys */
  isInSync: boolean;
}

// ---- Service ----

export function checkLocales(input: CheckLocalesInput): CheckLocalesResult {
  const localeMap = new Map<string, Set<string>>();
  const localesInfo: LocaleInfo[] = [];

  for (const arg of input.localeArgs) {
    const { name, filePath } = parseLocaleArg(arg);
    const data = loadLocale(name, filePath);
    const keys = new Set(data.keys.keys());
    localeMap.set(name, keys);
    localesInfo.push({ name, filePath: data.filePath, keyCount: keys.size });
  }

  const { missingPerLocale, allKeys, unionKeys } = compareLocales(localeMap);

  const isInSync = [...missingPerLocale.values()].every((s) => s.size === 0);

  return {
    locales: localesInfo,
    unionKeys,
    allKeys,
    missingPerLocale,
    isInSync,
  };
}
