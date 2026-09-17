# Execution safety

Rules for anything Upkeep spawns, proxies, elevates, times out, cancels, or cleans up after. Each rule exists because the unguarded version failed on this machine; [environment.md](environment.md) carries the measurements and [postmortem/](postmortem/README.md) the narratives.

## Spawning

- **Never inherit the ambient environment wholesale.** Build the child environment explicitly: inherit the variables the tool needs, then add the proxy values from [proxy resolution](#proxy-resolution). The parent process environment is not modified, ever.
- **`Stdio::null()` for stdin on every child.** A missing argument can otherwise make a tool start an interactive TUI, consume the terminal, and exit with a code that looks like a crash. Nothing Upkeep runs may wait for input.
- **No shell.** Spawn the executable with an argument vector; never `cmd /c` or `powershell -Command` a composed string. Quoting rules differ per shell and paths on this machine contain spaces.
- **Resolve an npm shim instead of invoking one.** A globally installed npm CLI is a `.cmd`/`.ps1` shim, not an executable, and running it means running a shell. `platform` reads the shim, resolves the Node script it points at, and spawns `node` with that script, so the "no shell" rule holds for `pi`, `codex`, and `claude` alike. A shim that cannot be resolved is reported as `NotInstalled` with the shim's path.
- **Set the working directory explicitly** and keep it inside the app's own directory or `%LOCALAPPDATA%\Upkeep\work`. A tool that writes relative files must not litter a random CWD.
- **Pass non-interactive flags the tool documents**, such as `--yes` for a package manager that would otherwise prompt. A tool with no non-interactive mode is not eligible for `manager`, `self-update-cli`, or `declarative`; it belongs in `external-ui` or `green`.
- **Cap concurrency** at `settings.concurrency`. Registry probes are network-bound; installers compete for the same disk and lock the same installation directories.

## Proxy resolution

1. Read `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` and take `ProxyEnable` and `ProxyServer`.
2. `settings.proxy: system` uses that value; `none` skips proxies; an explicit `http://host:port` overrides it.
3. Inject the resolved value per child as `HTTPS_PROXY`, `HTTP_PROXY`, and `ALL_PROXY`, with `NO_PROXY` for loopback so local tooling keeps working.
4. Never write the registry, never set a process-wide environment variable, and never hardcode a port: the xray process restarts and the port can change between runs.

Tools that do not read the system proxy still need this injection — see the [tool table](environment.md#proxy-behaviour-by-tool). Tools that *do* read it (anything .NET) tolerate the injection, so one code path covers both.

## Output handling

- **Strip ANSI escapes and carriage-return progress redraws before the stream reaches a log file or the UI.** Raw TUI output makes a log unreadable.
- **Stream line by line** to the run log and to `update://progress`, keeping the last N lines for the UI. Never buffer a whole install in memory.
- **Redact known secret shapes** (tokens, `Authorization` headers) from log lines. `GITHUB_TOKEN` exists only in the process environment for the request that needs it.
- **A log file is created per run per app** at `%LOCALAPPDATA%\Upkeep\logs\<app_id>-<run>.log`, and its path goes into the history record, so a failure is always reachable to its evidence.
- **Never re-run a child to "get more output".** The first run's log is the evidence; a retry is a new run with a new record.

## Timeout, preflight, and ETA guard

- **Every provider probe and every update has an explicit timeout** from `settings.timeout_s` or the provider's own stricter value. No child runs unbounded.
- **Preflight before a large download.** When `update.preflight` is set, probe the source with a small ranged request, measure throughput, and estimate the total from the asset size.
- **Warn before hitting a hard limit.** With `eta_guard_min`, an estimate above that many minutes stops the batch and asks for a different node rather than burning the tool's own timeout — `omp update` aborts at 15 minutes and the wasted attempt teaches nothing.
- **A timeout is a failure of that app only.** Record `result: failed`, keep the log, and continue with the batch unless `on_failure: stop`.

## Cancellation and teardown

- **Kill the process tree**, not the direct child. A wrapper that spawned a downloader leaves the downloader running otherwise.
- **Respect Windows' refusal.** A kill that fails must be reported with the process id and name, not swallowed; the UI then offers closing the app or skipping it.
- **Wait for the child to settle before touching its files.** Cleanup and verification both run after the process handle is reaped.
- **Never delete a partially written artifact** that the tool's own recovery may need: a `.bak`, a partial download, or an updater temp directory is removed only by a [cleanup rule](cleanup-rules.md) that matched it, never as part of a failed update.

## Process guard

- `skip_if_running` is evaluated before the operation, not between files. If a guard process is running, the whole rule or update is skipped and reported as `skipped`, with the process name in the reason.
- `must_close` is a user decision: Upkeep asks, and either kills the process (as part of the same run, recorded in history) or skips the app. It never kills an application the user did not confirm.
- Windows file locks surface as `0x80073D02` and similar; the message names the process Upkeep believes holds the file, and the fallback is always "close it and retry", never retry-with-force.
- Detect by process name, and treat an empty process list as success only when the platform call actually succeeded.

## Elevation

Chocolatey operations need administrator rights; UAC severs the parent's stdio pipes, so an elevated helper cannot stream its output back through them.

1. `plan` marks the step `needs_admin` and the UI states that a UAC prompt will appear.
2. `exec` starts the helper with `ShellExecuteW` and the `runas` verb.
3. The helper writes its own JSONL records — one line per completed unit plus a terminal result — into a temp file whose path the parent chose.
4. The parent reads that file after the helper exits, folds the lines into the run log and history, and deletes the temp file only after it has been read successfully.
5. A user who dismisses the prompt is a `skipped` outcome with `exit_code` from `ShellExecuteW`, not a crash.

With `settings.uac: mark-only`, Upkeep still plans the operation but renders it as "run this elevated yourself" and hands the user the exact command instead of prompting.
