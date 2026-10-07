# Architecture

## Layers

- `src/app/`: bootstrap, environment, i18n, router, providers, and global styles.
- `src/pages/`: route-level composition and local presentation state only.
- `src/layouts/`: reusable screen shells such as `PageLayout`.
- `src/modules/`: domain state and features for `app`, `auth`, `user`, `project-enrollment`, `defense`, and `thesis-process`.
- `src/shared/`: domain-neutral components, model helpers, utilities, assets, constants, and types.

Modules expose their supported API from their root `index.ts`. Cross-module deep imports are forbidden. Module `models/` own Reatom state, data fetching, mutations, and business rules; `features/` own interactions and rendering. A module with global concerns exposes one provider that composes its internal setup.

`shared/` must not depend on modules. Avoid new circular dependencies and do not
deepen the existing auth/user cycle. Module-specific constants stay inside their
module; transport-only helpers may live in a module's `api/`.

## Routing

TanStack Router generates `src/app/routeTree.gen.ts` from `src/app/routes`; never edit the generated file.
Route files select pages and read typed route context/params, not domain logic.

| Path                           | Screen                        |
| ------------------------------ | ----------------------------- |
| `/login`                       | Authentication                |
| `/`                            | Role-specific home            |
| `/project-enrollment`          | Role-specific enrollment list |
| `/project-enrollment/$roundId` | Enrollment round              |
| `/defense/$roundId`            | Defense schedule              |
| `/schedule`                    | Student schedule              |
| `/thesis-process`              | Current user's theses         |
| `/thesis-process/$processId`   | Thesis process details        |

Pathless `(auth)` and `(app)` groups apply authentication redirects. Role-specific screens use `roleBasedComponent`; permission-controlled fragments use `Guard`.

## Runtime integration

`src/app/main.tsx` initializes Reatom logging, i18n, CSS, and the shared API before rendering `ProvidersWrapper`. `src/app/api.ts` configures the API base URL; auth state manages its token. Do not repeat this wiring in features.
