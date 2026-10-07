# Development

Complete the [repository setup](../../../docs/development.md). Consuming the
checked-in client does not require generation or a package-local `.env`.

## Runtime usage

Configure the shared client once in the consuming application's integration
layer. Authentication code owns token updates:

```ts
import { API } from '@repo/api';

API.setBaseURL('http://localhost:8000');
API.setToken(token);
// On logout:
API.removeToken();
```

Generated endpoints return `ApiResponse<T>`; check `response.ok` before reading
`data`. See [conventions](conventions.md) for SDK failure behavior.

## Regeneration

From the repository root:

```bash
cp packages/api/.env.example packages/api/.env
```

Configure the schema URL using the [environment variable reference](environment.md),
then generate:

```bash
pnpm generate
```

`generate.mjs` downloads the schema, patches the backend security scheme, clears
`src/generated/`, runs Orval, removes the temporary schema, and adds camelCase
model aliases. `orval.config.ts` controls tag grouping and the shared mutator.
Root `pnpm generate` also formats the result; the package's `generate` script
does not.

Change generator behavior in these configuration files rather than patching
output. Regeneration replaces generated files: review the diff and run affected
consumer checks. Do not regenerate for unrelated formatting changes.
