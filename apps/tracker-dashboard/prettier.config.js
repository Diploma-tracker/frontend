import baseConfig from '@repo/code-tools-config/prettier/react';

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  tailwindStylesheet: './src/app/styles/index.css',
};

export default config;
