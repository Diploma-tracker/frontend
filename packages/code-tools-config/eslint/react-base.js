import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import * as pluginReactComponentName from 'eslint-plugin-react-component-name';
import globals from 'globals';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for apps/packages that use React.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-component-name': pluginReactComponentName,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',

      // Allow named functions in React components for better stack traces and debugging (reatom recommendations).
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'react-component-name/react-component-name': [
        'error',
        {
          targets: ['reatomComponent', 'memo'],
        },
      ],
    },
  },

  // Module architectural rules for React apps/packages.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/modules/*/**',
                'src/modules/*/**',
                'modules/*/**',
                '../modules/*/**',
                '../../modules/*/**',
              ],
              message:
                'This import pattern is not allowed. Please import from the module\'s public API (e.g., "@/modules/auth" instead of "@/modules/auth/some/internal/file").',
            },
          ],
        },
      ],
    },
  },
];
