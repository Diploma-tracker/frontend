---
name: ui-kit
description: Install, update, extend, and consume packages/ui-kit (@repo/ui-kit). Use when working with shadcn components, reusable UI, shared styles, exports, or UI kit integration.
---

# UI Kit

`packages/ui-kit` is the single source of truth for reusable UI components in this repository.

Keep shadcn-generated components and custom reusable UI inside this package. Do not create parallel reusable component libraries inside apps or other packages.

App-specific screens, business logic, routing, API calls, translations, and product state belong in the consuming app.

## Read before editing

Resolve paths from the repository root.

Read the root `AGENTS.md`, the nearest workspace instructions, and:

- [UI kit instructions](../../../packages/ui-kit/AGENTS.md)
- [package.json](../../../packages/ui-kit/package.json)
- [components.json](../../../packages/ui-kit/components.json)
- [architecture](../../../packages/ui-kit/docs/architecture.md)
- [conventions](../../../packages/ui-kit/docs/conventions.md)
- [development](../../../packages/ui-kit/docs/development.md)
- [commands](../../../packages/ui-kit/docs/commands.md)

Derive versions, aliases, CLI options, styling configuration, exports, and task names from the current repository configuration.

Do not migrate or pin tooling versions during ordinary component work unless explicitly requested.

## Consume the UI kit

If a workspace does not depend on the UI kit yet, add it from the repository root:

```bash
pnpm --filter <consumer> add '@repo/ui-kit@workspace:*'
```

Build the package before consuming its exports:

```bash
pnpm build --filter=@repo/ui-kit
```

Use public package exports only:

```tsx
import { Button } from "@repo/ui-kit/components/common/data-display/button";
import "@repo/ui-kit/styles.css";
```

Do not import another workspace's `src/` or `dist/` files directly.

There is no package-wide component barrel. Follow the export map in `package.json`.

## Add shadcn components

Before generating anything, search `packages/ui-kit/src` recursively for an existing implementation.

Existing components may live inside category folders such as `components/common/`, so do not check only the top-level `components` directory.

Run shadcn from `packages/ui-kit`.

Use the repository-provided CLI when available; otherwise use:

```bash
pnpm dlx shadcn add <component> --dry-run
pnpm dlx shadcn add <component>
```

See the [official shadcn CLI documentation](https://ui.shadcn.com/docs/cli).

Always preview generated changes first.

Keep generation inside `packages/ui-kit`; do not initialize shadcn inside consuming apps.

After generation:

- place the component according to the existing source structure;
- adapt generated imports to the repository layout;
- reuse existing components, hooks, and helpers where possible;
- review generated dependencies and CSS changes;
- keep required runtime dependencies in the UI kit package;
- ensure the component is available through a public package export.

## Update existing components

Treat these as separate operations:

- updating shadcn component source;
- upgrading a dependency;
- modifying a local component.

For shadcn source updates, preview or diff the incoming version before changing local code.

The CLI may not detect components moved into category folders and may suggest creating a duplicate top-level component. Compare against the existing implementation and merge relevant upstream changes instead of blindly overwriting customized files.

For dependency upgrades, update only the requested dependencies and corresponding lockfile entries.

Preserve public imports and exports unless an API change is intentional.

## Add custom reusable UI

Prefer extending or composing existing primitives before creating a new component.

Place:

- reusable, domain-neutral components in `packages/ui-kit/src/components`;
- UI hooks in `src/hooks`;
- UI helpers in `src/lib`;
- framework-independent algorithms in `@repo/utils`.

Follow the package's existing styling system, semantic tokens, accessibility patterns, responsive behavior, dark mode, refs, and controlled/uncontrolled component patterns.

## Validate changes

Use the current validation commands documented in:

[package validation guidance](../../../packages/ui-kit/docs/commands.md#validation)

Run the relevant type, lint, format, and build checks for `@repo/ui-kit`.

If public imports or behavior changed, also validate affected consumers.

For interactive components, check keyboard navigation, focus behavior, responsive layouts, and themes.

The UI kit currently has no dedicated test script.

For documentation-only changes, validate the touched Markdown separately.
