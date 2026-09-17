# `src/ipc/` — the bridge

The only place in the frontend that names a Tauri command or event. Every other module imports from here, so a renamed command breaks in one file rather than in every panel.

Conventions:

- One module per command group (`scan.ts`, `update.ts`, `clean.ts`, `settings.ts`, `history.ts`, `logs.ts`), each exporting a typed function that wraps `invoke` and returns a typed result.
- Event subscriptions export a hook or a `subscribe` function that returns an unsubscribe handle; a component that subscribes must release the handle on unmount, or a re-mounted panel accumulates listeners.
- Payload types live here and mirror the Rust serde representation. The command and event tables in [docs/architecture.md](../../docs/architecture.md#ipc-surface) are the source of truth for names and fields; when the Rust side changes, both change together.
- An error from the core is a typed result, not a thrown string: a wrapper maps the core's error enum into the shape the UI renders (reason, app id, exit code, log path) so a panel never has to parse a message.
- No wrapper performs a decision — no defaulting a missing version to "latest", no silently downgrading an argument list. The mirror is a mirror.

When M1 lands, the payload types are generated from the Rust types or checked against them by a script; until then the same change must edit both sides, and a mismatch is a bug in the change, not a runtime surprise to discover later.
