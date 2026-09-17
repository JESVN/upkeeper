# 0001 — `omp update` burned its 15-minute limit on a direct connection

Recorded 2026-09-17 from the measurements that produced the v0.1 design; the incident itself predates [DESIGN.md](../../DESIGN.md).

## Impact

An `omp` self-update failed after roughly 15 minutes with no download to show for it — the tool's own hard limit, not a hang. Repeating the attempt reproduced it. The same 161 MB payload completed in 12.7 seconds once the request went through the proxy, so the loss was the entire wait plus the retry.

## What happened

1. `omp update` was invoked from a shell that had a working system proxy configured and reachable.
2. The tool connected directly to GitHub and transferred nothing.
3. It did not fail fast. It kept the connection open until its own 15-minute limit expired, then exited.
4. The first diagnostic attempts made the picture worse: `curl` returned `HTTP=000` against both the direct and the proxied URL, so the obvious probe tool could not distinguish "network down" from "tool ignores proxy".
5. `gh` failed until `HTTPS_PROXY` was exported into its environment explicitly, which localized the problem to proxy inheritance rather than connectivity.
6. `.NET` (`Invoke-WebRequest`) was the one client that inherited the system proxy automatically, and through it the same release downloaded at 12.7 s per 161 MB — proving the network path was healthy the whole time.

## Root cause

`omp` runs on Bun, whose `fetch` does not read the Windows system proxy from the registry. The system proxy is not process state that a child inherits; it is a registry setting that individual clients must choose to consult. `.NET` consults it; Bun `fetch`, `gh`, `curl`, `rustup`, and `cargo` do not.

Two secondary failures turned a five-minute diagnosis into a much longer one: a child process with no argument and no stdin redirection started an interactive TUI and exited `129`, which reads like a crash rather than a usage error; and TUI escape sequences written into the log made the captured output unreadable.

## Fix

- Proxy resolution became an explicit step: read `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` on every run, then inject `HTTPS_PROXY`, `HTTP_PROXY`, and `ALL_PROXY` into the one child that needs them.
- The registry is never written and the parent environment is never modified, so a failed update cannot leave the machine's networking changed.
- The port is read per run rather than remembered, because the xray process restarts and the port can change.
- `update.preflight` plus `eta_guard_min` exists so an implausible transfer estimate is caught before the tool's own limit is spent on it.
- stdin is `Stdio::null()` for every child, and ANSI escapes are stripped before output reaches a log or the UI.
- `curl` is not used as a reachability probe; `.NET` or Upkeep's own HTTP client is.

## Rules

- [Proxy resolution](../execution-safety.md#proxy-resolution) — registry-read per run, per-child injection, no port constant.
- [Spawning](../execution-safety.md#spawning) — stdin null, no shell, non-interactive flags.
- [Timeout, preflight, and ETA guard](../execution-safety.md#timeout-preflight-and-eta-guard) — the guard that replaces a 15-minute mistake with a warning.
- [Output handling](../execution-safety.md#output-handling) — ANSI stripping and per-run log files.
- [Proxy behaviour by tool](../environment.md#proxy-behaviour-by-tool) — the measured table this incident produced.
