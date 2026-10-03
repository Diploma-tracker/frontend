# Consumer setup

Complete the [repository setup](../../../docs/development.md). Consumers declare
`@repo/tailwind-config` as a workspace dependency. No environment variables are
required.

## Application styles

Import the full setup from the app's global stylesheet:

```css
@import '@repo/tailwind-config';
```

It includes Tailwind preflight, the shared theme, and FullCalendar overrides.

## UI library styles

Import tokens without duplicating app-global preflight:

```css
@import '@repo/tailwind-config/tokens';
```

Libraries own their Tailwind utilities and prefix setup. See the
[UI kit configuration](../../ui-kit/docs/development.md#configuration).

## Optional PostCSS

For builds using PostCSS instead of a dedicated Tailwind plugin:

```js
import { postcssConfig } from '@repo/tailwind-config/postcss';

export default postcssConfig;
```

The consuming workspace must install `@tailwindcss/postcss`; the preset only
configures it.
