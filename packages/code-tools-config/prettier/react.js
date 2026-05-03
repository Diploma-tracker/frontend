import baseConfig from "./base.js";

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  ...baseConfig,

  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],

  // Prettier React Options
  bracketSpacing: true,
  arrowParens: "always",
  jsxSingleQuote: false,
  bracketSameLine: false,

  // Tailwind Options
  tailwindFunctions: ["clsx", "cva"],

  // Sort Imports Options
  importOrder: [
    "<BUILTIN_MODULES>",
    "^react(-.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@repo/(.*)$",
    "^[./]",
    "\\.(css|scss|sass|less)$",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
