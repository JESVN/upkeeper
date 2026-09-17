# `src-tauri/src/platform/`

The only module in the tree that talks to Windows. Everything here is a thin, testable wrapper: it does one OS thing and returns a typed result, so the rest of the core can be written as if the machine were a data source.

| Module | Owns |
|---|---|
| `proxy.rs` | Reading `ProxyEnable` and `ProxyServer` from `HKCU\...\Internet Settings` per call, resolving `settings.proxy` into a concrete value |
| `http.rs` | Building the `reqwest` client with the resolved proxy, timeouts, and the JSON/text helpers each source uses |
| `proc.rs` | Enumerating processes by name, checking a guard, killing a process tree, waiting for a child to settle |
| `spawn.rs` | The single child-process entry point: explicit environment, `Stdio::null()` stdin, ANSI-stripping output reader, cancellation handle |
| `elevate.rs` | `ShellExecuteW` with the `runas` verb, the temp-file JSONL handoff, and reading the helper's records back |
| `file_version.rs` | Reading `VS_VERSION_INFO` from an executable |
| `ansi.rs` | Stripping escape sequences and carriage-return redraws from a byte stream |

Rules:

- The rules this module implements are in [docs/execution-safety.md](../../../docs/execution-safety.md); this directory must not weaken one for convenience. The registry is read, never written, and no proxy value is stored.
- One wrapper per OS operation. A caller that needs a combination composes the wrappers rather than adding a new function that does both.
- Every function returns a typed error carrying the OS code, so a failure in a log says `0x80073D02` rather than "access denied".
- Anything that can block runs on the async runtime's blocking pool, not on the caller's thread.
- `unsafe` is permitted here only, with a comment naming the invariant that makes the call sound.
