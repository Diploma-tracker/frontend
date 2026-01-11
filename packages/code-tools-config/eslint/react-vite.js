import { config as reactBaseConfig } from "./react-base.js";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";

/**
 * A custom ESLint configuration for apps/packages that use React with Vite.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [
  ...reactBaseConfig,
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactRefresh.configs.vite.rules,
    },
  },
];
