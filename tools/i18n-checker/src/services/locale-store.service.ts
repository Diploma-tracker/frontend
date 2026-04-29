import {
  loadLocale,
  writeLocale,
  parseLocaleArg,
  type LocaleData,
} from "../core/locale-loader.js";

// ---- DTOs ----

export interface LocaleKeyEntry {
  /** Dot-notation key, e.g. "auth.login.title" */
  key: string;
  /** Translated value for this locale */
  value: string;
}

export interface LocaleStoreEntry {
  name: string;
  filePath: string;
  keys: LocaleKeyEntry[];
}

// ---- LocaleStore ----

/**
 * Manages one or more locale JSON files loaded from disk.
 * All mutation methods operate on the in-memory representation;
 * call `save()` or `saveAll()` to persist changes.
 */
export class LocaleStore {
  private readonly locales: Map<string, LocaleData>;

  private constructor(locales: LocaleData[]) {
    this.locales = new Map(locales.map((l) => [l.name, l]));
  }

  // ---- Factory ----

  /**
   * Load locales from "name=path" argument strings.
   */
  static fromArgs(localeArgs: string[]): LocaleStore {
    const locales = localeArgs.map((arg) => {
      const { name, filePath } = parseLocaleArg(arg);
      return loadLocale(name, filePath);
    });
    return new LocaleStore(locales);
  }

  /**
   * Load locales from explicit name→path pairs.
   */
  static fromPaths(entries: { name: string; filePath: string }[]): LocaleStore {
    const locales = entries.map(({ name, filePath }) =>
      loadLocale(name, filePath),
    );
    return new LocaleStore(locales);
  }

  // ---- Queries ----

  /**
   * Return all dot-notation keys defined in a locale.
   * If no locale name is given, returns the union across all locales.
   */
  getAllKeys(localeName?: string): string[] {
    if (localeName !== undefined) {
      return [...this.getLocaleOrThrow(localeName).keys.keys()].sort();
    }
    const union = new Set<string>();
    for (const locale of this.locales.values()) {
      for (const key of locale.keys.keys()) union.add(key);
    }
    return [...union].sort();
  }

  /**
   * Return all key→value entries for a locale.
   */
  getEntries(localeName: string): LocaleKeyEntry[] {
    const locale = this.getLocaleOrThrow(localeName);
    return [...locale.keys.entries()].map(([key, value]) => ({ key, value }));
  }

  /**
   * Return a snapshot of every loaded locale with their entries.
   */
  getAll(): LocaleStoreEntry[] {
    return [...this.locales.values()].map((locale) => ({
      name: locale.name,
      filePath: locale.filePath,
      keys: [...locale.keys.entries()].map(([key, value]) => ({ key, value })),
    }));
  }

  /** List loaded locale names. */
  getLocaleNames(): string[] {
    return [...this.locales.keys()];
  }

  /** Check whether a key exists in a given locale. */
  has(localeName: string, key: string): boolean {
    const locale = this.locales.get(localeName);
    return locale?.keys.has(key) ?? false;
  }

  // ---- Mutations ----

  /**
   * Add or update a key in one or all locales.
   * @param localeName - target locale, or `'*'` to apply to all locales
   * @param key        - dot-notation key
   * @param value      - translation string
   */
  add(localeName: string | "*", key: string, value: string): void {
    const targets =
      localeName === "*"
        ? [...this.locales.values()]
        : [this.getLocaleOrThrow(localeName)];
    for (const locale of targets) {
      locale.keys.set(key, value);
    }
  }

  /**
   * Remove one or more keys from one or all locales.
   * Returns the total number of (locale × key) deletions performed.
   * @param localeName - target locale name, or `'*'` to remove from all
   * @param key        - a single dot-notation key or an array of keys
   */
  remove(localeName: string | "*", key: string | string[]): number {
    const targets =
      localeName === "*"
        ? [...this.locales.values()]
        : [this.getLocaleOrThrow(localeName)];
    const keys = Array.isArray(key) ? key : [key];
    let affected = 0;
    for (const locale of targets) {
      for (const k of keys) {
        if (locale.keys.delete(k)) affected++;
      }
    }
    return affected;
  }

  // ---- Persistence ----

  /** Write a single locale back to its JSON file. */
  save(localeName: string): void {
    writeLocale(this.getLocaleOrThrow(localeName));
  }

  /** Write all locales back to their JSON files. */
  saveAll(): void {
    for (const locale of this.locales.values()) {
      writeLocale(locale);
    }
  }

  // ---- Private helpers ----

  private getLocaleOrThrow(name: string): LocaleData {
    const locale = this.locales.get(name);
    if (!locale) {
      throw new Error(
        `Locale "${name}" not found. Available: ${[...this.locales.keys()].join(", ")}`,
      );
    }
    return locale;
  }
}
