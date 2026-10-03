# Architecture

## Internal structure

| Path                   | Responsibility                                                           |
| ---------------------- | ------------------------------------------------------------------------ |
| `src/api/`             | `IApiClient`, `ApiResponse<T>`, `ApiError`, and the shared Axios adapter |
| `src/generated/`       | Orval-generated endpoint groups and models; never edit manually          |
| `src/orval/mutator.ts` | Routes generated requests through the shared `API` instance              |
| `src/sdk/`             | Handwritten multi-request workflows, including init/upload/commit        |
| `src/types/`           | Handwritten contracts not owned by the generator                         |
| `src/utils/`           | Internal transformation helpers                                          |

The shared adapter maps outgoing camelCase keys to snake_case and incoming keys
back to camelCase. Generation adds matching camelCase model aliases.

## Public entry points

Exports resolve to TypeScript source; this package has no build step.

- `@repo/api`: `API`, HTTP contracts, endpoint namespaces, and selected model types.
- `@repo/api/types`: handwritten contracts.
- `@repo/api/model`: generated model types.
- Endpoint groups: `auth`, `iam`, `allocation-round`, `supervision-application`,
  `thesis-defense-session`, and `bachelor-thesis` under `@repo/api/`.
- `@repo/api/bachelor-thesis-process`: SDK facade over generated process endpoints.

Prefer narrow subpath imports. Keep `package.json#exports` and the root barrel
consistent with intentional public APIs; adapter, mutator, and utility files
remain internal.
