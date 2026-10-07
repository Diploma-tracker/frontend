# Development

Complete the [repository setup](../../../docs/development.md). No runtime
environment variables are required by this package.

## Build and consume

From the repository root:

```bash
pnpm build --filter=@repo/ui-kit
```

The workspace Turbo configuration builds components before styles. A component
build cleans `dist/`, so reversing the order deletes the generated CSS.

Consumers declare `@repo/ui-kit` as a workspace dependency, use React 19, and
import public subpaths plus styles:

```tsx
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import '@repo/ui-kit/styles.css';
```

For component development, run both [watch tasks](commands.md); a component-only
watcher does not rebuild CSS.

## Configuration

- `tsconfig.json`: component compilation and declaration output.
- `src/styles.css`: prefixed Tailwind theme/utilities and shared token imports,
  without app-wide preflight.
- `components.json`: Shadcn New York style, CSS variables, Phosphor icons, and
  the `ui` prefix. Review generated components against local conventions.
- `prettier.config.js` and `eslint.config.mjs`: shared React tooling presets.
