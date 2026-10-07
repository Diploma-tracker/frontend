# Development

Complete the [repository setup](../../../docs/development.md). This package
needs no runtime environment variables or additional configuration.

## Usage

Declare `@repo/utils` as a workspace dependency and import its public API:

```ts
import { parseDuration, serializeDuration } from '@repo/utils/duration';

parseDuration('PT90M').hours; // 1
serializeDuration({ hours: 1, minutes: 30 }); // 'PT1H30M'
```

`parseDuration('')` returns `{}`; an empty/zero duration serializes as `PT0S`.
Normalization carries seconds, minutes, and hours into larger units, but does
not convert calendar months or years into days. Date intervals use elapsed
milliseconds rounded to seconds, not calendar arithmetic.

`tsconfig.json` controls compilation; ESLint and Prettier configurations extend
the shared presets. See [commands](commands.md) for build and checks.
