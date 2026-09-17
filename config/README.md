# `config/`

Home of the shipped application registry.

| File | Role |
|---|---|
| `apps.yaml` | The default registry: settings, applications, and their cleanup rules. The field reference is [docs/config-schema.md](../docs/config-schema.md) |

Two things are worth knowing before editing it:

- **A user file wins.** `%LOCALAPPDATA%\Upkeep\apps.yaml` overrides this one per app id and per settings key, so a value here is a default rather than the final answer. Never hardcode a machine-specific value in Rust because it is "in the config anyway" — the config is the only place a value belongs.
- **`# TBD:` is a promise, not a placeholder.** It means nobody has confirmed the value with a probe, and the row renders as `unknown` until somebody does ([procedure](../docs/cookbook/verifying-a-release-source.md)). Do not remove a marker by guessing, and do not add an app whose version source is a guess.

This directory holds data only: no code, no generated files, and no machine-specific paths outside `%VAR%` patterns. Rules that delete files follow [docs/cleanup-rules.md](../docs/cleanup-rules.md), and measured sizes live in [docs/environment.md](../docs/environment.md), not here.
