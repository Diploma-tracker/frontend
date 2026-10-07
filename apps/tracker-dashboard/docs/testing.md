# Testing Guide

This document describes the testing conventions for `tracker-dashboard`.

## Stack

The project uses:

- **Vitest** — test runner, assertions, mocks, spies.
- **React Testing Library** — React component rendering and DOM queries.
- **Testing Library User Event** — user interactions such as typing and clicking.
- **jest-dom** — additional DOM assertions for Vitest.
- **jsdom** — browser-like DOM environment.
- **MSW** — HTTP API mocking.

## Test Location

Production code and tests are separated.

```text
src/
  modules/
  shared/

tests/
  setup/
  fixtures/
  modules/
    auth/
    user/
    defense/
    ...
  shared/
```

Tests should generally mirror the production structure.

Example:

```text
src/modules/auth/models/login-action.ts

tests/modules/auth/login-action.test.ts
```

Use:

```text
*.test.ts
```

for logic/model tests and:

```text
*.test.tsx
```

for React component tests.

---

## What Should Be Tested

Test **behavior and business rules**, not implementation details.

### Model / Unit Tests

Use Vitest directly for:

- Reatom models and actions.
- Computed state.
- Validation.
- Filtering and pagination logic.
- Data transformations.
- Shared utilities.
- Business rules.

Example:

```text
Changing a filter resets the current page to 1.
```

Do not test trivial getters, setters, or atoms without meaningful behavior.

---

### Component / Feature Tests

Use React Testing Library for user-visible behavior.

Test scenarios such as:

```text
User enters data
→ clicks a button
→ state changes
→ UI displays the expected result
```

Prefer queries that reflect how users interact with the UI:

```ts
screen.getByRole(...)
screen.getByLabelText(...)
screen.findByText(...)
```

Use:

```ts
const user = userEvent.setup();
```

for interactions.

Do not test:

- React internals.
- Reatom implementation details.
- Internal component state.
- CSS class names unless the class itself is part of the requirement.

Prefer:

```ts
expect(button).toBeDisabled();
```

over checking an internal boolean.

---

## API Tests

Feature tests should mock the backend with **MSW**.

Do not mock generated API functions by default:

```ts
vi.mock('@repo/api/auth');
```

Instead, keep the real request flow:

```text
Reatom
→ @repo/api
→ Axios
→ HTTP
→ MSW
```

This also verifies serialization, response parsing, and API adapters.

MSW handlers should represent the **real backend HTTP contract**.

Example backend response:

```json
{
  "access_token": "test-token"
}
```

Do not return transformed frontend models such as:

```json
{
  "accessToken": "test-token"
}
```

unless the backend actually returns that format.

Use `server.use(...)` inside a test to override the default response for error or edge-case scenarios.

---

## Mocking Rules

Use **MSW** for HTTP requests.

Use `vi.fn`, `vi.spyOn`, or `vi.mock` for dependencies that are not part of the behavior being tested, for example:

- analytics;
- browser APIs;
- external integrations;
- callbacks;
- isolated infrastructure.

Avoid mocking your own business logic when an integration-style test can use the real implementation.

---

## Test Isolation

Every test must be independent.

Reset:

- temporary MSW handlers;
- mocked functions;
- mutable Reatom state when necessary.

Never depend on another test running before the current one.

---

## Recommended Test Strategy

Use the smallest useful test level.

```text
Business logic
→ Vitest

Reatom model/action
→ Vitest

React behavior
→ Vitest + React Testing Library

React + API flow
→ Vitest + React Testing Library + MSW
```

Do not create a test for every file.

Prioritize:

- business-critical behavior;
- state transitions;
- forms and validation;
- API success/error flows;
- permissions;
- filters and pagination;
- complex user interactions;
- regression-prone logic.

The main rule is:

> Test what the application must guarantee, not how the implementation currently works.
