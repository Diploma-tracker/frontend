# Consumer configuration

Complete the [repository setup](../../../docs/development.md). Consumers declare
`@repo/code-tools-config` in `devDependencies` with `workspace:*`; no environment
variables or build step are needed.

## ESLint

Choose the least-specific preset that fits the workspace. For a plain
TypeScript workspace, `eslint.config.mjs` can contain:

```js
import { config } from '@repo/code-tools-config/eslint/base';

export default [...config];
```

React libraries use `eslint/react-base`; Vite React apps use `eslint/react-vite`.
Append local file scopes or ignores instead of duplicating shared rules.

## Prettier

In `prettier.config.js` for an ESM workspace:

```js
import config from '@repo/code-tools-config/prettier/base';

export default { ...config };
```

React consumers use `prettier/react` and may supply local options such as
`tailwindStylesheet`. Shared conventions stay in the preset, not copied configs.
