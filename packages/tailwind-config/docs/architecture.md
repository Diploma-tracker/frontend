# Architecture

| File                | Responsibility                                                       |
| ------------------- | -------------------------------------------------------------------- |
| `tokens.css`        | Light `:root` and `.dark` variables, exposed through `@theme inline` |
| `shared-styles.css` | Tailwind, tokens, and FullCalendar styles for app-global use         |
| `fullcalendar.css`  | Global vendor overrides using semantic tokens                        |
| `postcss.config.js` | Optional named `postcssConfig` export                                |

Public entry points are `@repo/tailwind-config` for full styles,
`@repo/tailwind-config/tokens` for variables/theme without preflight, and
`@repo/tailwind-config/postcss` for PostCSS configuration.

Keep `package.json#exports` aligned with these files. CSS is consumed directly;
this package has no standalone build output.
