# Development

Setup and daily workflow. The components this machine already has are listed in [environment.md](environment.md#toolchain-and-prerequisites); this file owns the steps and the reasons they are ordered the way they are. Milestone acceptance lives in [testing.md](testing.md).

## Bootstrap without a working system proxy

`rustup` downloads from `static.rust-lang.org` and `cargo` from `crates.io`; neither reads the Windows system proxy, and `curl` is unusable here ([evidence](environment.md#proxy-behaviour-by-tool)). So M0 starts by giving those two processes an explicit proxy for their own lifetime only.

1. Read the proxy from the registry rather than assuming the port — the xray process restarts and the port can change.

   ```powershell
   $proxy = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer
   $env:HTTPS_PROXY = "http://$proxy"; $env:HTTP_PROXY = $env:HTTPS_PROXY
   ```

2. Install the toolchain in this shell, so the variables are inherited only by `rustup-init` and the `rustup` it spawns.

   ```powershell
   winget install Rustlang.Rustup        # or run the downloaded rustup-init.exe in this shell
   rustup default stable-x86_64-pc-windows-msvc
   rustc --version; cargo --version      # verify: both print a version, no network error
   ```

3. Prefer a mirror over a proxy for the package index, because a mirror survives a proxy port change. `%USERPROFILE%\.cargo\config.toml`:

   ```toml
   [source.crates-io]
   replace-with = "rsproxy-sparse"

   [source.rsproxy-sparse]
   registry = "sparse+https://rsproxy.cn/index/"

   [net]
   git-fetch-with-cli = true
   ```

4. First build downloads several hundred crates into `src-tauri/target` and costs 3–5 GB on G:. When it fails, the failure is a fetch failure, not a code failure: re-run in the same shell with the proxy exported, and do not retry a third time without changing source or proxy.
5. Frontend dependencies need no proxy work in the common case. If the npm registry is unreachable, mirror it for this project only: `npm config set registry https://registry.npmmirror.com --location project`.
6. Scaffold the shell once the toolchain works: Tauri v2 with React 19, Vite, TypeScript, Tailwind v4, under `src/` and `src-tauri/`. The generated files must land in the directories this repo already declares — [src/](../src/README.md) and [src-tauri/](../src-tauri/README.md) — not in a new subproject folder.

**Verify M0.** `pnpm tauri dev` opens a window that renders the empty shell, `cargo build` completes offline after the first successful build, and `git status` shows no generated artifacts inside the tracked source directories.

### Running M0 unattended

M0 is the one milestone safe to run overnight: it installs tooling and scaffolds directories, and nothing it does is destructive or hard to reverse. Three things make it work without a person present:

- **No questions.** The handoff skill forbids the question tool during unattended work; the decision rule and its two lists are in [`.agents/progress.md`](../.agents/progress.md). M0's own decisions — Tailwind `@theme` file layout, scaffold option spellings, mirror versus proxy — are all reversible, so they belong in the unattended decision log rather than in a prompt nobody will answer.
- **The proxy step is not optional.** `rustup` and `cargo` ignore the Windows system proxy, so step 1 must run before anything is downloaded. A first run that stalls on a fetch is this, not a broken network.
- **A failed fetch is not a failed milestone.** Report where it stopped, leave the partial download in place, and record which step needs a second attempt. Do not retry a third time against the same source; change the source or the proxy instead.

## Daily workflow

```sh
pnpm tauri dev                  # dev window with HMR on the frontend
pnpm typecheck                  # tsc --noEmit
pnpm test                       # frontend unit tests
cargo fmt --check               # in src-tauri/
cargo clippy -- -D warnings
cargo test                      # core + provider tests
pnpm run doc-budgets            # word ceilings from docs/AGENTS.md
```

Watch the Cargo build directory: `src-tauri/target` grows to several GB and must never be committed or cleaned by an Upkeep rule.

## Environment variables

| Variable | Effect |
|---|---|
| `HTTPS_PROXY` / `HTTP_PROXY` | Read by Upkeep's own HTTP client only as a fallback when `settings.proxy: system` cannot read the registry; injected per child for tools that need it |
| `GITHUB_TOKEN` | Optional; raises the GitHub API rate limit for `latest.kind: github` probes |
| `UPKEEP_HOME` | Overrides `%LOCALAPPDATA%\Upkeep` for state, history, logs, and the user `apps.yaml`; used by tests to keep a real profile clean |
| `RUST_LOG` | Tracing filter for the core; `info` is the normal level, `trace` logs every child line |

## Packaging

`pnpm tauri build` produces an NSIS installer and an MSI under `src-tauri/target/release/bundle/`. The build is unsigned, so SmartScreen warns on first run — the same situation as the other self-updated tools on this machine, and not a defect to work around with a disable-able flag.

The installer creates a Start Menu shortcut because Windows requires a stable AppId for toasts from a non-packaged executable; without it, notifications silently do not appear ([ui.md](ui.md#copy-and-notifications)).

## Repository hygiene

- Never commit anything from `%LOCALAPPDATA%\Upkeep` — state, history, logs, and rollback copies are user data.
- Never commit a proxy value, a token, or a machine-specific path that is not already a `%VAR%` pattern.
- Keep `scripts/` for repo-local helpers and the PowerShell baselines; product logic never lives there.
- A change that alters behaviour, a contract, or a format adds an [Agent Note](../.agents/notes/README.md) in the same change.
