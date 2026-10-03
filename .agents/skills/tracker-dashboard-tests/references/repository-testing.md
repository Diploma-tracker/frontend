# Repository Testing Reference

Read this when implementing or modifying tests.

This document describes the repository-specific testing setup and integration boundaries.

Always inspect the current project configuration, existing tests, and installed package versions before introducing new patterns.

## Test setup

Tests for `tracker-dashboard` live under:

```text
apps/tracker-dashboard/tests/
```

Relevant infrastructure:

```text
apps/tracker-dashboard/vitest.config.ts
apps/tracker-dashboard/tests/setup/setup.ts
apps/tracker-dashboard/tests/setup/msw/server.ts
apps/tracker-dashboard/tests/setup/msw/handlers.ts
apps/tracker-dashboard/tsconfig.test.json
```

Reuse the existing testing infrastructure.

Do not create parallel:

- Vitest configuration,
- MSW servers,
- global setup,
- test environments,

unless the existing infrastructure cannot support the required behavior.

Check `apps/tracker-dashboard/package.json`, the lockfile, and installed types when library API details matter.

## Test structure

Tests should mirror production ownership where practical.

Example:

```text
tests/
├── modules/
│   ├── auth/
│   └── user/
├── shared/
├── fixtures/
├── utils/
└── setup/
```

Use:

```text
.test.ts   → logic and model tests
.test.tsx  → React tests
```

Do not colocate tests inside `src/`.

## Choosing the test level

Test observable behavior and business guarantees rather than implementation details.

Use unit or model tests for meaningful isolated logic such as:

- validation,
- transformations,
- filtering,
- pagination,
- calculations,
- permissions,
- non-trivial state transitions.

Use feature or component integration tests when the behavior depends on collaboration between multiple application layers.

For HTTP-backed features, prefer preserving the real flow:

```text
user interaction
→ React
→ Reatom
→ @repo/api
→ Axios
→ MSW
→ resulting UI/state
```

Do not create tests simply because a production file exists.

Avoid duplicating the same guarantee across multiple layers.

## React tests

Use the existing React testing stack:

- React Testing Library,
- `userEvent`,
- jest-dom.

Prefer:

```ts
const user = userEvent.setup();
```

Await user interactions.

Prefer accessible queries:

- `getByRole`,
- `getByLabelText`,
- `findBy...`,
- `within(...)` when query scope matters.

Prefer assertions against behavior visible to the user.

Avoid testing:

- private state,
- implementation-specific action ordering,
- CSS classes unless they are part of the contract,
- library internals,
- snapshots as the primary assertion.

## HTTP and MSW

Use the shared MSW server.

Use:

```ts
server.use(...)
```

for scenario-specific handlers.

Add handlers to the shared handler collection only when they are reusable defaults.

Keep the real API client and transformations involved when they are part of the behavior being tested.

MSW handlers must represent the real backend HTTP contract:

- method,
- URL,
- request body,
- query parameters,
- headers when relevant,
- status,
- raw response body.

Do not return frontend-transformed models or `ApiResponse` wrappers when the backend returns a different shape.

Inspect API contracts through the public `@repo/api` exports and their implementation when necessary.

Do not import another workspace's private `src/` files from tests when a public package export exists.

Generated API files may be inspected but must not be edited manually.

## Fixtures and factories

Check existing:

```text
tests/fixtures/
tests/utils/
```

before creating new helpers.

Use factories for recurring or sufficiently complex domain objects.

Factories should:

- return fresh values,
- use deterministic sensible defaults,
- support partial overrides,
- return fresh mutable nested values when relevant,
- use public project types where practical.

Avoid:

- large duplicated inline objects,
- authored `any`,
- casts that hide incomplete fixtures,
- unnecessary abstractions for simple one-off data.

A small one-off object does not need a factory.

## Table-driven tests

When multiple test cases verify the same behavior with different inputs and expected results, prefer table-driven tests using Vitest `it.each(...)` / `test.each(...)`.

Prefer object-based cases when inputs contain more than one meaningful field:

```ts
it.each([
  {
    name: "serializes hours",
    input: { hours: 1 },
    expected: "PT1H",
  },
  {
    name: "serializes minutes",
    input: { minutes: 5 },
    expected: "PT5M",
  },
])("$name", ({ input, expected }) => {
  expect(serializeDuration(input)).toBe(expected);
});
```

Use tuple-based cases only for very small and obvious datasets:

```ts
it.each([
  ["PT1H", { hours: 1 }],
  ["PT5M", { minutes: 5 }],
])("parses %s", (input, expected) => {
  expect(parseDuration(input)).toEqual(expected);
});
```

Prefer table-driven tests for:

- validation cases,
- parsers and serializers,
- transformations,
- calculations,
- boundary values,
- invalid inputs,
- multiple inputs sharing the same assertion flow.

Keep separate `it(...)` tests when the scenario requires:

- different setup,
- different assertions,
- different side effects,
- substantially different behavior.

Do not force unrelated scenarios into one table only to reduce the number of tests.

For larger tables, include a descriptive `name` field and use it as the test title:

```ts
it.each(cases)("$name", ({ input, expected }) => {
  // assertion
});
```

A table row should describe one behavioral case. Keep test data explicit and readable rather than hiding important values behind unnecessary helper abstractions.

## Reatom

The project uses Reatom 1000-series APIs.

Before using Reatom-specific testing APIs:

1. check the installed Reatom version,
2. inspect existing project usage,
3. inspect existing test helpers,
4. follow current project conventions,
5. verify unfamiliar APIs against the project's current Reatom documentation.

Do not use APIs or testing patterns from older Reatom versions.

Use real Reatom state when it is part of the behavior being tested.

If the tested code uses module-level or otherwise shared state, ensure the relevant state is isolated or reset between tests.

A fresh fixture object does not reset imported singleton state.

Prefer real minimal Reatom primitives over handwritten behavioral mocks when practical.

If the model's own state transitions are the subject of the test, exercise the real model.

## Test isolation

Every test must be independent.

Reset or isolate only the mutable state relevant to the test, such as:

- MSW handlers,
- Vitest mocks and spies,
- mutable Reatom state,
- forms,
- cookies,
- storage,
- API authorization or configuration,
- timers,
- subscriptions,
- other global browser state.

Mock clearing alone does not reset shared Reatom state.

Await or dispose pending work when it could affect later tests.

Avoid blanket module resets unless there is a specific reason to use them.

## Async behavior

Wait for observable asynchronous outcomes using:

- `findBy...`,
- `waitFor(...)` when necessary.

Do not:

- put repeatable user actions inside `waitFor`,
- add arbitrary sleeps,
- rely on timing when a controlled response or promise can be used.

Test loading or pending states only when they protect meaningful product behavior.

## Validation

After implementing or modifying tests, run the smallest relevant test selection.

Example:

```bash
pnpm --filter tracker-dashboard test tests/modules/auth/login.test.tsx
```

If several related tests were changed, run the relevant test directory or subset.

Do not automatically run:

```text
the entire test suite
type checks
lint
format checks
build
```

after every isolated test change.

Run broader validation when there is a concrete reason, for example:

- shared test infrastructure was changed,
- shared fixtures or utilities were changed,
- production code was changed together with the tests,
- types outside the test may be affected,
- several modules are affected,
- the focused test reveals a broader problem,
- the task explicitly requests full validation.

When broader validation is appropriate, use the existing repository scripts rather than inventing new commands.

Consult:

```text
apps/tracker-dashboard/docs/commands.md
```

when current validation requirements or commands are needed.

Always report which checks were actually run and their results.

Do not claim that an MSW-backed test validates the live backend.

## General rule

Keep testing changes proportional to the requested work.

Do not expand an isolated testing task into unrelated:

- production refactoring,
- test infrastructure redesign,
- repository-wide cleanup,
- broad validation,

unless it is required to correctly implement the requested behavior.
