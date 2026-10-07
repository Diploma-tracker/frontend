# Consumer configuration

Complete the [repository setup](../../../docs/development.md). Consumers declare
`@repo/typescript-config` in `devDependencies` with `workspace:*` and install
their own TypeScript compiler. No environment variables or build step are
needed for the presets themselves.

For an emit-capable plain TypeScript package:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

React libraries extend `react-library.json`; Vite React apps extend
`react-vite.json`. Consumers own `include`, `exclude`, output paths, and local
aliases. Keep those workspace-specific values out of shared presets.
