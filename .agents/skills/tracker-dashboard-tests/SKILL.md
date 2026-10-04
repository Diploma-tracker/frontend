---
name: tracker-dashboard-tests
description: Design and implement behavior-focused tests for apps/tracker-dashboard using Vitest, React Testing Library, Reatom, MSW, and the existing repository test infrastructure. Use for test planning, coverage decisions, test implementation, and improving existing tests.
---

# Tracker Dashboard Tests

Write tests that protect observable behavior and meaningful business guarantees.

Do not optimize for file coverage, test count, or one-test-file-per-production-file.

Prefer the smallest set of tests that would catch meaningful regressions.

## Before writing tests

1. Read applicable `AGENTS.md` files.
2. Inspect the target feature and its existing tests.
3. Read:
   - `apps/tracker-dashboard/docs/testing.md`
   - `apps/tracker-dashboard/docs/commands.md`
4. For implementation work, read [the repository testing reference](references/repository-testing.md).
5. Check existing coverage before adding new tests.
6. Identify:
   - the behavior being protected,
   - the trigger,
   - the observable result,
   - the dependencies involved,
   - the appropriate test level.

For implementation tasks, proceed without requiring an additional approval step.

## Choose the right test level

### Unit or model tests

Use for meaningful isolated logic such as:

- validation,
- transformations,
- filtering,
- pagination,
- calculations,
- permissions,
- non-trivial state transitions,
- important edge cases.

Exercise the real logic with controlled inputs and assert public outputs or state.

Do not add isolated tests for trivial wrappers, getters, setters, or state containers only because they exist.

### Feature or component integration tests

Prefer integration tests when a guarantee depends on collaboration between application layers.

Typical flow:

```text
user interaction
→ React
→ Reatom
→ API client
→ HTTP
→ resulting UI/state
```

Render the smallest real feature that proves the behavior.

Keep business logic real whenever practical.

Use MSW to control backend responses.

### Do not test directly

Usually avoid dedicated tests for:

- trivial presentation components,
- simple getters or setters,
- trivial atoms,
- wrappers without meaningful behavior,
- third-party library behavior,
- behavior already sufficiently covered at another layer.

A trivial file may still participate in a valuable integration test.

## Avoid duplicated coverage

Do not create one suite per production file.

Do not automatically split a single feature flow into separate tests for its:

- React component,
- Reatom model,
- action,
- API wrapper,
- HTTP client.

Protect distinct guarantees, not implementation layers.

A typical feature may need:

- a success case,
- a meaningful failure case,
- important edge cases.

If complex logic has many branches, cover the branch matrix at unit/model level and keep only representative integration tests for wiring.

## Dependency boundaries

Keep dependencies real when they are part of the behavior being tested.

Prefer real:

- React components,
- business logic,
- Reatom models and actions,
- validation,
- transformations,
- `@repo/api`,
- API client behavior.

For backend-dependent feature tests, use MSW instead of mocking internal API layers.

Do not mock internal actions, API exports, or Axios merely to manufacture an expected result.

Mock dependencies that are outside the selected behavior, such as:

- analytics,
- unsupported browser APIs,
- unrelated external integrations,
- callback boundaries,
- isolated infrastructure.

Mocks should simplify irrelevant boundaries, not replace the behavior being tested.

## Assertions

Prefer observable behavior over implementation details.

For UI tests, prefer:

- visible content,
- accessible state,
- user interaction results,
- meaningful application state.

Avoid asserting:

- private state,
- internal action ordering,
- implementation-specific call counts,
- CSS classes unless they are part of the contract,
- snapshots as the primary assertion,
- library internals.

Assert HTTP payloads, query parameters, or headers only when they are part of the behavior being protected.

## Organize reusable test support

Before writing tests, inspect existing `tests/fixtures`, `tests/mocks`, and `tests/utils`.

When the task covers an entire module, establish or reuse small module-level test support before duplicating the same setup across individual suites. Extract only concepts that are likely to be reused.

Use these ownership rules:

- `tests/fixtures` → deterministic domain data and raw HTTP DTO factories, such as `createUser()` or `createLoginHttpResponse()`.
- `tests/mocks` → reusable dependency behavior, especially MSW handler factories and reusable external-boundary stubs.
- `tests/utils` → reusable test infrastructure and lifecycle helpers, such as `resetAuthTestState()`, render helpers, or small Reatom test-state builders.
- `tests/setup` → global test-environment wiring only: MSW server lifecycle, Testing Library cleanup, and other suite-wide hooks.

Create reusable factories when test data is recurring or sufficiently complex. Factories should:

- return fresh values,
- use deterministic defaults,
- support partial overrides,
- use real public types when practical.

Keep raw HTTP DTO fixtures separate from frontend/domain fixtures when the API client transforms data.

Do not introduce unnecessary abstraction for small one-off test data. A small interaction helper used by only one suite may stay in that test file.

Do not recreate the same mock, fixture, handler, reset routine, or helper independently across multiple tests.

Keep `vi.mock` and `vi.hoisted` declarations in test files unless the project has a verified setup-file pattern for that mock. Do not hide hoisted Vitest module mocks in ordinary imported utility modules.

## Reatom

Use real Reatom state when it is part of the tested behavior.

Before using Reatom-specific testing APIs:

1. check the installed Reatom version,
2. inspect existing project usage,
3. inspect existing test helpers,
4. verify unfamiliar APIs against current project documentation.

Do not use APIs or patterns from older Reatom versions.

If the model's transitions are the subject of the test, exercise the real model.

If a Reatom dependency is unrelated to the behavior being tested, use the smallest appropriate controlled test primitive or existing helper.

## Test isolation

Every test must be independent.

Reset or isolate only state relevant to the test.

This may include:

- MSW handlers,
- mocks and spies,
- Reatom state,
- forms,
- cookies,
- storage,
- API configuration,
- timers,
- subscriptions,
- global browser state.

Do not assume mock clearing resets imported singleton state.

Ensure pending asynchronous work cannot affect later tests.

Avoid broad module resets unless they are specifically required.

## Async behavior

Wait for observable outcomes.

Prefer:

- `findBy...`,
- `waitFor(...)` when necessary.

Do not:

- use arbitrary sleeps,
- repeatedly trigger user actions inside `waitFor`,
- depend on timing when a controlled response or promise can be used.

Test loading or pending states only when they protect meaningful product behavior.

## Validation

After implementing or modifying tests, run the smallest relevant test selection first.

Do not automatically run the entire repository tooling suite after an isolated test change.

Broaden validation only when there is a concrete reason, for example:

- shared test infrastructure changed,
- shared fixtures or helpers changed,
- production code changed,
- multiple modules are affected,
- types outside the test may be affected,
- the focused test reveals a broader issue,
- the task explicitly requests broader validation.

Use existing repository commands rather than inventing new ones.

Report:

- what behavior was covered,
- what test level was chosen,
- which checks were actually run,
- their results,
- blockers if any.

Do not claim that an MSW-backed test validates the live backend.

## Scope discipline

Keep test work proportional to the requested task.

Do not expand an isolated testing change into unrelated:

- production refactoring,
- test infrastructure redesign,
- repository-wide cleanup,
- broad validation,

unless required to correctly implement the requested behavior.
