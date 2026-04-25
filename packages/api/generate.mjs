#!/usr/bin/env node
// generate.mjs — fetch OpenAPI schema, patch it, run orval, cleanup
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHEMA_URL =
  process.env.OPENAPI_SCHEMA_URL ?? "http://localhost:8000/schema/openapi.json";
const SCHEMA_PATH = path.join(__dirname, "schema.json");

console.log(`Fetching OpenAPI schema from: ${SCHEMA_URL}`);

const res = await fetch(SCHEMA_URL);
if (!res.ok) {
  console.error(`Failed to fetch schema: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const schema = await res.json();

// Patch IAMTokenAuth security scheme — backend emits non-standard fields
// that fail OpenAPI validation. Fix to a valid http bearer scheme.
if (schema?.components?.securitySchemes?.IAMTokenAuth) {
  schema.components.securitySchemes.IAMTokenAuth = {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  };
}

fs.writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2), "utf-8");
console.log("Schema saved.");

// Clear generated folder before running orval
const GENERATED_DIR = path.join(__dirname, "src/generated");
if (fs.existsSync(GENERATED_DIR)) {
  console.log("Clearing generated folder...");
  fs.rmSync(GENERATED_DIR, { recursive: true, force: true });
}

console.log("Running orval...");

try {
  execSync("pnpm exec orval --config orval.config.ts", {
    stdio: "inherit",
    cwd: __dirname,
  });
} finally {
  fs.unlinkSync(SCHEMA_PATH);
  console.log("Cleanup done.");
}

// Post-process: wrap all interfaces in generated/model with CamelCaseKeys
const MODEL_DIR = path.join(__dirname, "src/generated/model");
const CAMEL_CASE_IMPORT = `import type { CamelCaseKeys } from '../../utils/camel-case';`;

console.log("Post-processing generated model interfaces with CamelCaseKeys...");

const modelFiles = fs
  .readdirSync(MODEL_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts");

for (const file of modelFiles) {
  const filePath = path.join(MODEL_DIR, file);
  let content = fs.readFileSync(filePath, "utf-8");

  // Find all exported interface names and rename them to Raw* prefix
  const interfaceRegex = /^export interface (\w+)/gm;
  const interfaceNames = [];
  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    interfaceNames.push(match[1]);
  }

  // Find exported type aliases with inline object shape: export type Foo = { ... }
  const typeAliasRegex = /^export type (\w+) = \{/gm;
  const typeAliasNames = [];
  while ((match = typeAliasRegex.exec(content)) !== null) {
    typeAliasNames.push(match[1]);
  }

  const allNames = [...interfaceNames, ...typeAliasNames];
  if (allNames.length === 0) continue;

  // Rename each interface from FooBar to RawFooBar (if not already prefixed)
  for (const name of interfaceNames) {
    if (!name.startsWith("Raw")) {
      content = content.replaceAll(`interface ${name}`, `interface Raw${name}`);
    }
  }

  // Rename each type alias from FooBar to RawFooBar (if not already prefixed)
  for (const name of typeAliasNames) {
    if (!name.startsWith("Raw")) {
      // Replace only the declaration, not any usages of the type elsewhere
      content = content.replaceAll(`export type ${name} = {`, `export type Raw${name} = {`);
    }
  }

  // Add CamelCaseKeys import if not already present
  if (!content.includes(CAMEL_CASE_IMPORT)) {
    // Insert after the last existing import line (or at end of header block)
    const lastImportMatch = [...content.matchAll(/^import .+$/gm)].at(-1);
    if (lastImportMatch) {
      const insertAt = lastImportMatch.index + lastImportMatch[0].length;
      content =
        content.slice(0, insertAt) +
        "\n" +
        CAMEL_CASE_IMPORT +
        content.slice(insertAt);
    } else {
      // No imports yet — add after the header comment block
      const headerEnd = content.indexOf("\nexport ");
      if (headerEnd !== -1) {
        content =
          content.slice(0, headerEnd) +
          "\n" +
          CAMEL_CASE_IMPORT +
          content.slice(headerEnd);
      }
    }
  }

  // Append CamelCaseKeys type alias with the original name (without Raw prefix)
  for (const name of allNames) {
    const rawName = name.startsWith("Raw") ? name : `Raw${name}`;
    const alias = `\nexport type ${name} = CamelCaseKeys<${rawName}>;\n`;
    if (!content.includes(`export type ${name} `)) {
      content += alias;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
}

console.log(`Post-processing done (${modelFiles.length} files scanned).`);
