# Diploma tracker frontend monorepo

Monorepo repository containing the frontend part of the Diploma tracker application for KHPI university.

## Tech stack

<div align="center">
    <a href="https://www.typescriptlang.org/" target="_blank">
        <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=a0001b" alt="Typescript"/>
    </a>
    <a href="https://reactjs.org/" target="_blank">
        <img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logoColor=white&logo=react&color=a0001b" alt="React" />
    </a>
    <a href="https://ui.shadcn.com/" target="_blank">
        <img src="https://img.shields.io/badge/-Shadcn UI-black?style=for-the-badge&logoColor=white&logo=shadcnui&color=a0001b" alt="shadcnui" />
    </a>
    <a href="https://tailwindcss.com/" target="_blank">
        <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=a0001b" alt="tailwindcss" />
    </a>
    <a href="https://reatom.js.org/" target="_blank">
        <img src="https://img.shields.io/badge/-Reatom-black?style=for-the-badge&logo=redux&logoColor=white&color=a0001b" alt="Reatom" />
    </a>
    <a href="https://tanstack.com/router" target="_blank">
        <img src="https://img.shields.io/badge/-Tanstack Router-black?style=for-the-badge&logo=tanstack&logoColor=white&color=a0001b" alt="Tanstack Router" />
    </a>
</div>

## Dev instruments

<div align="center">
    <a href="https://turborepo.org/" target="_blank">
        <img src="https://img.shields.io/badge/-Turborepo-black?style=for-the-badge&logoColor=white&logo=turborepo&color=1a1a1a" alt="Turborepo" />
    </a>
    <a href="https://pnpm.io/" target="_blank">
        <img src="https://img.shields.io/badge/-PNPM-black?style=for-the-badge&logoColor=white&logo=pnpm&color=1a1a1a" alt="PNPM" />
    </a>
    <a href="https://vitejs.dev/" target="_blank">
        <img src="https://img.shields.io/badge/-Vite-black?style=for-the-badge&logoColor=white&logo=vite&color=1a1a1a" alt="Vite" />
    </a>
    <a href="https://eslint.org/" target="_blank">
        <img src="https://img.shields.io/badge/-Eslint-black?style=for-the-badge&logoColor=white&logo=eslint&color=1a1a1a" alt="eslint" />
    </a>
    <a href="https://prettier.io/" target="_blank">
        <img src="https://img.shields.io/badge/-prettier-black?style=for-the-badge&logoColor=white&logo=prettier&color=1a1a1a" alt="prettier" />
    </a>
    <a href="https://commitlint.js.org/" target="_blank">
        <img src="https://img.shields.io/badge/-commit_lint-black?style=for-the-badge&logoColor=white&logo=commitlint&color=1a1a1a" alt="commit lint" />
    </a>
    <a href="https://github.com/features/actions" target="_blank">
        <img src="https://img.shields.io/badge/-github_actions-black?style=for-the-badge&logoColor=white&logo=githubactions&color=1a1a1a" alt="githubactions" />
    </a>
</div>

## Table of Contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Monorepo structure](#monorepo-structure)
- [Scripts](#root-scripts)
- [Apps/packages scripts](#appspackages-scripts)
- [Environment Variables](#environment-variables)

## Requirements

- Node.js + `pnpm` package manager
- Configured `.env` file

## Quick start

- Install dependencies: `pnpm install`
- Configure dashboard environment variables in [apps/tracker-dashboard/.env](apps/tracker-dashboard/.env)
- Run in development mode (all packages with `dev`): `pnpm dev`

## Monorepo structure

- `apps/` — applications ([tracker-dashboard](apps/tracker-dashboard/README.md))
- `packages/` — shared packages and configs ([ui-kit](packages/ui-kit/README.md), [api-types](packages/api-types/README.md), [code-tools-config](packages/code-tools-config/README.md))

## Scripts

### Root scripts

Scripts are run from the repository root.

- `pnpm dev` — run all packages with `dev` via Turbo
- `pnpm build` — build all packages
- `pnpm lint` — lint code
- `pnpm lint:fix` — lint with auto-fixes
- `pnpm format` — check formatting
- `pnpm format:fix` — auto-format
- `pnpm check-types` — type checking
- `pnpm create:app` — create a new app
- `pnpm create:package` — create a new package

### Apps/packages scripts

Depending on what scripts are defined in each package, you can run them from the `root` using commands like:

```bash
pnpm --filter tracker-dashboard dev
```

```bash
pnpm --filter ui-kit build:components
```

> [!TIP]
> If you want see all available scripts for a package, you can run:  
> `pnpm --filter <package-name> run`
>
> If you want see all available workspaces in monorepo, you can run:
> `pnpm m list --depth -1 --json`

Or you can check `package.json` of the package/app and run scripts directly from there:

```bash
cd apps/tracker-dashboard
pnpm dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

Dashboard for tracker `.env` file (`apps/tracker-dashboard/.env`):

| Parameter      | Description                                |
| :------------- | :----------------------------------------- |
| `NODE_ENV`     | Node environment (development, production) |
| `VITE_API_URL` | URL of the backend API                     |
