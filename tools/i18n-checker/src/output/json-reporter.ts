import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function writeJsonReport(filePath: string, data: unknown): void {
  const absPath = resolve(filePath);
  writeFileSync(absPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\nJSON report written to: ${absPath}`);
}

/** Convert Sets inside objects to sorted arrays for JSON serialization */
export function serializeForJson(obj: unknown): unknown {
  if (obj instanceof Set) {
    return [...obj].sort();
  }
  if (obj instanceof Map) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of obj) {
      result[String(k)] = serializeForJson(v);
    }
    return result;
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeForJson);
  }
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = serializeForJson(v);
    }
    return result;
  }
  return obj;
}
