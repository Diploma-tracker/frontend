import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export type FlatKeys = Map<string, string>;

/**
 * Recursively flatten a nested JSON object into dot-notation keys.
 * e.g. { a: { b: "val" } } → Map { "a.b" => "val" }
 */
function flatten(
  obj: unknown,
  prefix = "",
  result: FlatKeys = new Map(),
): FlatKeys {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    result.set(prefix, String(obj));
    return result;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flatten(value, fullKey, result);
    } else {
      result.set(fullKey, String(value));
    }
  }

  return result;
}

export interface LocaleData {
  name: string;
  filePath: string;
  keys: FlatKeys;
}

export function loadLocale(name: string, filePath: string): LocaleData {
  const absolutePath = resolve(filePath);
  const raw = readFileSync(absolutePath, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const keys = flatten(json);
  return { name, filePath: absolutePath, keys };
}

/**
 * Parse a "name=path" locale argument string.
 */
export function parseLocaleArg(arg: string): {
  name: string;
  filePath: string;
} {
  const eqIdx = arg.indexOf("=");
  if (eqIdx === -1) {
    throw new Error(
      `Invalid locale argument "${arg}". Expected format: name=path/to/file.json`,
    );
  }
  return { name: arg.slice(0, eqIdx), filePath: arg.slice(eqIdx + 1) };
}

/**
 * Convert dot-notation flat keys back into a nested object.
 * e.g. Map { "a.b" => "val" } → { a: { b: "val" } }
 */
export function unflatten(flat: FlatKeys): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const [dotKey, value] of flat) {
    const parts = dotKey.split(".");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof node[part] !== "object" || node[part] === null) {
        node[part] = {};
      }
      node = node[part] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }

  return root;
}

/**
 * Write a locale's flat keys back to its JSON file, preserving nested structure.
 */
export function writeLocale(data: LocaleData): void {
  const nested = unflatten(data.keys);
  writeFileSync(data.filePath, JSON.stringify(nested, null, 2) + "\n", "utf-8");
}
