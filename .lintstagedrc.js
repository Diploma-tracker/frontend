// @ts-check
const path = require("path");

const ROOT = process.cwd();

/**
 * Auto-generated files that must not be linted or formatted.
 */
const GENERATED_FILES = ["routeTree.gen.ts"];

/**
 * Packages that own an eslint.config.js.
 * ESLint is invoked from within each package directory so it picks up the
 * correct per-package flat config instead of requiring a root-level config.
 */
const ESLINT_PACKAGES = new Set([
  path.join("apps", "tracker-dashboard"),
  path.join("packages", "ui-kit"),
  path.join("packages", "utils"),
]);
/**
 * @param {string} filepath
 * @returns {boolean}
 */ function isGenerated(filepath) {
  return GENERATED_FILES.some((name) => filepath.endsWith(name));
}

/**
 * Returns the package dir relative to the monorepo root.
 * e.g. /root/apps/tracker-dashboard/src/foo.ts  →  apps/tracker-dashboard
 *//**
 * @param {string} filepath
 * @returns {string}
 */ function getPackageDir(filepath) {
  const parts = path.relative(ROOT, filepath).split(path.sep);
  return parts.length >= 2 ? path.join(parts[0], parts[1]) : ".";
}

/**
 * @param {readonly string[]} filenames
 * @returns {Record<string, string[]>}
 */
function groupByPackage(filenames) {
  return filenames.reduce((groups, filepath) => {
    const pkg = getPackageDir(filepath);
    (groups[pkg] ??= []).push(filepath);
    return groups;
  }, /** @type {Record<string, string[]>} */ ({}));
}

/**
 * Runs `eslint --fix` from within each package directory so each package's own
 * eslint.config.js is respected. Files are passed as relative paths.
 *
 * @param {readonly string[]} filenames - Absolute paths provided by lint-staged
 * @returns {string[]} Shell commands – one per affected package
 */
const buildEslintCommands = (filenames) => {
  const toCheck = filenames.filter((f) => !isGenerated(f));
  if (!toCheck.length) return [];

  const groups = groupByPackage(toCheck);

  return Object.entries(groups)
    .filter(([pkg]) => ESLINT_PACKAGES.has(pkg))
    .map(([pkg, files]) => {
      const pkgAbsPath = path.join(ROOT, pkg);
      const relFiles = files
        .map((f) => `"${path.relative(pkgAbsPath, f).replace(/\$/g, "\\$")}"`)
        .join(" ");
      return `sh -c 'cd "${pkgAbsPath}" && node_modules/.bin/eslint --fix --max-warnings 0 ${relFiles}'`;
    });
};

/**
 * Runs `prettier --write` from within each package directory so package-local
 * `.prettierignore` files are respected. Generated files are excluded.
 *
 * @param {readonly string[]} filenames - Absolute paths provided by lint-staged
 * @returns {string[]} Shell commands – one per affected package
 */
const buildPrettierCommand = (filenames) => {
  const toFormat = filenames.filter((f) => !isGenerated(f));
  if (!toFormat.length) return [];

  const groups = groupByPackage(toFormat);

  return Object.entries(groups).map(([pkg, files]) => {
    const pkgAbsPath = pkg === "." ? ROOT : path.join(ROOT, pkg);
    const relFiles = files
      .map((f) => `"${path.relative(pkgAbsPath, f).replace(/\$/g, "\\$")}"`)
      .join(" ");
    return `sh -c 'cd "${pkgAbsPath}" && prettier --write ${relFiles}'`;
  });
};

/** @type {import('lint-staged').Configuration} */
module.exports = {
  // TS/JS: eslint per-package first, then prettier across all in one shot
  "*.{ts,tsx,js,jsx}": [buildEslintCommands, buildPrettierCommand],

  // Everything else: prettier only
  "*.{json,md,css,scss}": buildPrettierCommand,
};
