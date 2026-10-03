# Preset maintenance conventions

- Keep this package tooling-only: no runtime code, business-domain assumptions,
  or dependencies unrelated to consumer tooling.
- Export ESLint presets as named `config` arrays and Prettier presets as default
  configuration objects. Extend existing layers rather than repeating rules.
- Preserve architectural restrictions: public module imports remain legal,
  while internal cross-module imports remain forbidden. Keep failure messages
  actionable.
- Keep shared formatting and import groups consistent. Consumers may add local
  options, not fork repository-wide formatting policy.
- Keep new restrictions generic; review existing consumer compatibility before
  tightening rules or changing plugin dependencies.
- Update public exports and consumer configuration examples together.

Shared maintenance rules are in the [root conventions](../../../docs/conventions.md).
