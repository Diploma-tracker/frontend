import type { Command } from "commander";
import { checkLocales } from "../services/check-locales.service.js";
import {
  printHeader,
  printSection,
  printSuccess,
  printWarning,
  printKeyList,
  printSummaryRow,
} from "../output/terminal.js";
import { writeJsonReport, serializeForJson } from "../output/json-reporter.js";

interface CheckLocalesOptions {
  locale: string[];
  json?: string;
}

export function registerCheckLocalesCommand(program: Command): void {
  program
    .command("check-locales")
    .description("Compare locale JSON files and report key differences")
    .requiredOption(
      "-l, --locale <name=path>",
      "Locale entry in format name=path/to/file.json (repeatable)",
      collect,
      [],
    )
    .option("--json <path>", "Write results to a JSON file at this path")
    .action((opts: CheckLocalesOptions) => {
      if (opts.locale.length < 2) {
        console.error("Error: at least 2 --locale entries are required.");
        process.exit(1);
      }

      printHeader("check-locales");

      const result = checkLocales({ localeArgs: opts.locale });

      // Loaded locales
      for (const locale of result.locales) {
        console.log(
          `  Loaded ${locale.name}: ${locale.keyCount} keys  (${locale.filePath})`,
        );
      }

      // Summary
      printSection("Key counts");
      printSummaryRow("Total unique keys (union)", result.unionKeys.size, true);
      printSummaryRow(
        "Keys present in all locales",
        result.allKeys.size,
        result.allKeys.size === result.unionKeys.size,
      );
      for (const locale of result.locales) {
        printSummaryRow(`Keys in "${locale.name}"`, locale.keyCount, true);
      }

      // Per-locale missing keys
      for (const [name, missing] of result.missingPerLocale) {
        if (missing.size === 0) {
          printSection(`Locale "${name}"`);
          printSuccess("All keys present — no gaps found.");
        } else {
          printSection(`Locale "${name}" — ${missing.size} missing key(s)`);
          printWarning(`${missing.size} key(s) missing:`);
          printKeyList(missing);
        }
      }

      if (result.isInSync) {
        printSection("Result");
        printSuccess("All locales are in sync!");
      }

      if (opts.json) {
        writeJsonReport(
          opts.json,
          serializeForJson({
            missingPerLocale: result.missingPerLocale,
            allKeys: result.allKeys,
            unionKeys: result.unionKeys,
          }),
        );
      }

      process.exit(result.isInSync ? 0 : 1);
    });
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
