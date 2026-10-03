# Architecture

## Source layout

| Path under `src/`                 | Content                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| `components/common/data-display/` | Buttons, badges, tables, pagination                            |
| `components/common/form/`         | Fields, controls, date and duration inputs                     |
| `components/common/floating/`     | Dialogs, drawers, popovers, tooltips, alerts, toasts           |
| `components/common/layout/`       | Cards, tabs, separators, scroll areas                          |
| `components/common/states/`       | Empty, loading, progress, skeleton states                      |
| `components/`                     | Compound primitives such as sidebar, combobox, chart, calendar |
| `hooks/`                          | Reusable UI hooks                                              |
| `lib/`                            | UI-only helpers                                                |

Use `@repo/utils` for framework-independent algorithms. Product-specific
compositions belong to the consuming app, not this library.

## Public exports

There is no package-wide component barrel. Import explicit subpaths, for example
`@repo/ui-kit/components/common/data-display/button`.

`package.json#exports` maps `components/*`, `hooks/*`, and `lib/*` to matching
JavaScript and declaration files in `dist/`; `styles.css` maps to
`dist/index.css`. New public files must compile to these paths. Keep internal
imports relative so the emitted package is self-contained.
