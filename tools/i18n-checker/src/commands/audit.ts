import type { Command } from "commander";
import { audit } from "../services/audit.service.js";
import {
  printHeader,
  printSection,
  printSuccess,
  printWarning,
  printError,
  printKeyList,
  printSummaryRow,
} from "../output/terminal.js";
import { writeJsonReport, serializeForJson } from "../output/json-reporter.js";

interface AuditOptions {
  locale: string[];
  dir: string;
  include: string[];
  ignore: string[];
  json?: string;
}

export function registerAuditCommand(program: Command): void {
  program
    .command("audit")
    .description(
      "Audit i18n keys: find dead keys (in locale but unused) and missing keys (used but absent)",
    )
    .requiredOption(
      "-l, --locale <name=path>",
      "Locale entry in format name=path/to/file.json (repeatable)",
      collect,
      [],
    )
    .requiredOption(
      "-d, --dir <path>",
      "Root directory to scan for source files",
    )
    .option(
      "--include <glob>",
      "Glob pattern for files to scan (repeatable, default: **/*.{ts,tsx})",
      collect,
      [],
    )
    .option(
      "--ignore <key>",
      "Key or pattern to exclude from used-key analysis (repeatable, supports * wildcards)",
      collect,
      [],
    )
    .option("--json <path>", "Write results to a JSON file at this path")
    .action(async (opts: AuditOptions) => {
      if (opts.locale.length < 1) {
        console.error("Error: at least 1 --locale entry is required.");
        process.exit(1);
      }

      printHeader("audit");

      const result = await audit({
        localeArgs: opts.locale,
        dir: opts.dir,
        include: opts.include,
        ignore: opts.ignore,
      });

      // Scan info
      console.log(`\n  Scanning: ${opts.dir}`);
      console.log(`  Patterns: ${result.include.join(", ")}`);
      console.log(
        `  Found ${result.usedKeys.size} unique used keys in source files.`,
      );

      // Loaded locales
      for (const locale of result.locales) {
        console.log(
          `  Loaded locale "${locale.name}": ${locale.keyCount} keys  (${locale.filePath})`,
        );
      }

      // Summary
      printSection("Summary");
      printSummaryRow("Used keys in source", result.usedKeys.size, true);
      printSummaryRow(
        "Total locale keys (union)",
        result.allLocaleKeys.size,
        true,
      );
      printSummaryRow("Dead keys (locale only, unused)", result.deadKeys.size);
      printSummaryRow(
        "Keys missing from all locales",
        result.missingFromAllLocales.size,
      );
      for (const [name, missing] of result.localeGaps) {
        printSummaryRow(`Locale gaps in "${name}"`, missing.size);
      }

      // Dead keys
      printSection(`Dead keys (${result.deadKeys.size})`);
      if (result.deadKeys.size === 0) {
        printSuccess("No dead keys found.");
      } else {
        printWarning(
          `${result.deadKeys.size} key(s) defined in locale files but never used in source:`,
        );
        printKeyList(result.deadKeys);
      }

      // Missing from all locales
      printSection(
        `Keys missing from all locales (${result.missingFromAllLocales.size})`,
      );
      if (result.missingFromAllLocales.size === 0) {
        printSuccess("All used keys have at least one locale definition.");
      } else {
        printError(
          `${result.missingFromAllLocales.size} key(s) used in source but absent from ALL locale files:`,
        );
        printKeyList(result.missingFromAllLocales);
      }

      // Locale gaps
      for (const [name, missing] of result.localeGaps) {
        printSection(`Locale gaps in "${name}" (${missing.size})`);
        if (missing.size === 0) {
          printSuccess(`Locale "${name}" has all keys.`);
        } else {
          printWarning(
            `${missing.size} key(s) present in other locales but missing from "${name}":`,
          );
          printKeyList(missing);
        }
      }

      if (result.isClean) {
        printSection("Result");
        printSuccess("Everything looks clean!");
      }

      if (opts.json) {
        writeJsonReport(
          opts.json,
          serializeForJson({
            usedKeys: result.usedKeys,
            allLocaleKeys: result.allLocaleKeys,
            deadKeys: result.deadKeys,
            missingFromAllLocales: result.missingFromAllLocales,
            localeGaps: result.localeGaps,
          }),
        );
      }

      process.exit(result.isClean ? 0 : 1);
    });
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
