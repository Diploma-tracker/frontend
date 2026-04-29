export interface DiffResult {
  /** Keys present in `a` but missing in `b` */
  missingInB: Set<string>;
  /** Keys present in `b` but missing in `a` */
  missingInA: Set<string>;
  /** Keys present in both */
  common: Set<string>;
}

export function diffKeySets(a: Set<string>, b: Set<string>): DiffResult {
  const missingInB = new Set<string>();
  const missingInA = new Set<string>();
  const common = new Set<string>();

  for (const key of a) {
    if (b.has(key)) {
      common.add(key);
    } else {
      missingInB.add(key);
    }
  }

  for (const key of b) {
    if (!a.has(key)) {
      missingInA.add(key);
    }
  }

  return { missingInB, missingInA, common };
}

export interface LocaleCompareResult {
  /** locale name → keys missing from that locale (present in at least one other) */
  missingPerLocale: Map<string, Set<string>>;
  /** Keys present in all locales */
  allKeys: Set<string>;
  /** Union of all keys across all locales */
  unionKeys: Set<string>;
}

export function compareLocales(
  locales: Map<string, Set<string>>,
): LocaleCompareResult {
  const allKeysArr: string[][] = [];
  const unionKeys = new Set<string>();

  for (const keys of locales.values()) {
    allKeysArr.push([...keys]);
    for (const k of keys) unionKeys.add(k);
  }

  // keys present in ALL locales
  const allKeys = new Set<string>(
    [...unionKeys].filter((k) => [...locales.values()].every((s) => s.has(k))),
  );

  const missingPerLocale = new Map<string, Set<string>>();
  for (const [name, keys] of locales) {
    const missing = new Set<string>();
    for (const k of unionKeys) {
      if (!keys.has(k)) missing.add(k);
    }
    missingPerLocale.set(name, missing);
  }

  return { missingPerLocale, allKeys, unionKeys };
}
