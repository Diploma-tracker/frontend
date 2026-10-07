# API conventions

- Keep this package transport-focused and framework-independent. UI, routing,
  application state, and business presentation belong to consumers.
- Put multi-request orchestration in `src/sdk/`; keep stable handwritten
  contracts in `src/types/` and broad generated types under `@repo/api/model`.
- Preserve `Promise<ApiResponse<T>>` for generated calls: success has `ok: true`
  and `data`; failure has `ok: false` and a typed `error`. SDK helpers may unwrap
  only with consistent typed failures.
- Preserve backend `detail`, status, and `extra` metadata. Never log tokens,
  sensitive payloads, or presigned URLs; consumers choose user-safe messages.
- File workflows must validate initialization results and upload URLs, upload
  without bearer authentication, and complete every upload before committing.
  Handle initialization, upload, and commit failures explicitly.
- Add convenience root type exports sparingly and keep internal helpers private.

Shared TypeScript and maintenance rules are in the
[root conventions](../../../docs/conventions.md).
