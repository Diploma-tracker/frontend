#!/usr/bin/env tsx
import { Command } from "commander";
import { registerCheckLocalesCommand } from "./commands/check-locales.js";
import { registerAuditCommand } from "./commands/audit.js";
import { registerFixCommand } from "./commands/fix.js";

const program = new Command();

program
  .name("i18n-checker")
  .description(
    "CLI tool to check i18n locale key consistency and audit used/dead keys",
  )
  .version("1.0.0");

registerCheckLocalesCommand(program);
registerAuditCommand(program);
registerFixCommand(program);

program.parse(process.argv);
