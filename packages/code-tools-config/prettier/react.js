import baseConfig from "./base.js";

/**
 * @see https://prettier.io/docs/configuration
/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  ...baseConfig,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
  jsxSingleQuote: false,
  bracketSameLine: false,
  // Tailwind Prettier Plugin Options
  tailwindFunctions: ["clsx", "cva"],
  // Sort Imports Plugin Options
  importOrder: [
    "<BUILTIN_MODULES>", // 1. Built-in utilities
    "^react(-.*)?$", // 2. React libraries
    "<THIRD_PARTY_MODULES>", // 3. Third-party modules
    "^@repo/(.*)$", // 4. Turborepo packages
    "^[./]", // 5. Other modules (relative imports)
    "\\.(css|scss|sass|less)$", // 6. Styles
  ],
  importOrderSeparation: true,
};

export default config;
