import chalk from "chalk";

export function printHeader(text: string): void {
  console.log("\n" + chalk.bold.cyan("━".repeat(60)));
  console.log(chalk.bold.cyan(` ${text}`));
  console.log(chalk.bold.cyan("━".repeat(60)));
}

export function printSection(title: string): void {
  console.log("\n" + chalk.bold.yellow(`▸ ${title}`));
}

export function printSuccess(msg: string): void {
  console.log(chalk.green(`  ✓ ${msg}`));
}

export function printError(msg: string): void {
  console.log(chalk.red(`  ✗ ${msg}`));
}

export function printWarning(msg: string): void {
  console.log(chalk.yellow(`  ⚠ ${msg}`));
}

export function printInfo(msg: string): void {
  console.log(chalk.gray(`    ${msg}`));
}

export function printKeyList(
  keys: Set<string> | string[],
  indent = "    ",
): void {
  const sorted = [...keys].sort();
  for (const key of sorted) {
    console.log(chalk.dim(indent) + chalk.white(key));
  }
}

export function printSummaryRow(
  label: string,
  value: number,
  good = false,
): void {
  const color = value === 0 ? chalk.green : good ? chalk.green : chalk.red;
  console.log(`  ${chalk.bold(label.padEnd(30))} ${color(String(value))}`);
}
