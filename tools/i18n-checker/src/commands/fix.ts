import type { Command } from "commander";
import { fix } from "../services/fix.service.js";
import {
  printHeader,
  printSection,
  printSuccess,
  printWarning,
  printInfo,
  printKeyList,
  printSummaryRow,
} from "../output/terminal.js";
import { writeJsonReport, serializeForJson } from "../output/json-reporter.js";

interface FixOptions {
  locale: string[];
  dir: string;
  include: string[];
  write: boolean;
  json?: string;
}

export function registerFixCommand(program: Command): void {
  program
    .command("fix")
    .description(
      "Remove dead i18n keys (defined in locale files but never used in source). " +
        "Dry-run by default — pass --write to apply changes.",
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
      "--write",
      "Apply changes and write modified locale files to disk",
      false,
    )
    .option("--json <path>", "Write results to a JSON file at this path")
    .action(async (opts: FixOptions) => {
      if (opts.locale.length < 1) {
        console.error("Error: at least 1 --locale entry is required.");
        process.exit(1);
      }

      printHeader(opts.write ? "fix  (write mode)" : "fix  (dry-run)");

      if (!opts.write) {
        printInfo("No files will be modified. Pass --write to apply changes.");
      }

      const result = await fix({
        localeArgs: opts.locale,
        dir: opts.dir,
        include: opts.include,
        write: opts.write,
      });

      // Scan info
      console.log(`\n  Scanning: ${opts.dir}`);
      console.log(`  Patterns: ${result.include.join(", ")}`);
      console.log(
        `  Found ${result.usedKeys.size} unique used keys in source files.`,
      );
      for (const locale of result.locales) {
        console.log(`  Locale "${locale.name}": ${locale.filePath}`);
      }

      // Summary
      printSection("Summary");
      printSummaryRow("Used keys in source", result.usedKeys.size, true);
      printSummaryRow("Dead keys found", result.deadKeys.size);

      if (result.deadKeys.size === 0) {
        printSection("Result");
        printSuccess("No dead keys found — nothing to remove.");
        process.exit(0);
      }

      // Per-locale breakdown
      printSection(`Dead keys to remove (${result.deadKeys.size})`);
      for (const locale of result.locales) {
        if (locale.removedKeys.length === 0) {
          printInfo(`Locale "${locale.name}": no dead keys.`);
        } else {
          printWarning(
            `Locale "${locale.name}" — ${locale.removedKeys.length} key(s):`,
          );
          printKeyList(locale.removedKeys, "      ");
        }
      }

      // Outcome
      printSection("Result");
      if (result.written) {
        printSuccess(
          `${result.deadKeys.size} dead key(s) removed and locale files saved.`,
        );
      } else {
        printWarning(
          `Dry-run: ${result.deadKeys.size} dead key(s) would be removed. Run with --write to apply.`,
        );
      }

      if (opts.json) {
        writeJsonReport(
          opts.json,
          serializeForJson({
            deadKeys: result.deadKeys,
            locales: result.locales,
            written: result.written,
          }),
        );
      }

      process.exit(0);
    });
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}
