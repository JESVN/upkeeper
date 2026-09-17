# Environment facts

Measured on this machine on 2026-09-17. These are the design's evidence: when one drifts, re-measure it here — [DESIGN.md](../DESIGN.md) keeps the v0.1 numbers as they stood when the design was written, and this file is the current truth.

## Application inventory

| App | Form | Path | Version | How the version was read |
|---|---|---|---|---|
| omp | self-update-cli | `%LOCALAPPDATA%\omp\omp.exe` | 18.2.4 | `omp --version` → `omp/18.2.4` |
| pi | npm-global | `%APPDATA%\npm\pi` | 0.85.1 | `npm ls -g --json` |
| codex | self-update-cli | npm global | 0.154.0 | `@openai/codex` |
| claude-code | self-update-cli | npm global | 2.1.274 | `@anthropic-ai/claude-code` |
| PiDeck | external-ui (electron) | `%LOCALAPPDATA%\Programs\PiDeck\PiDeck.exe` | 0.7.6 | `VS_VERSION_INFO` |
| CC Switch | external-ui (tauri) | `G:\CC Switch\cc-switch.exe` | 3.20.3 | `VS_VERSION_INFO` |
| Clash Verge | external-ui (tauri) | `G:\Clash Verge\clash-verge.exe` | 2.3.2 | `VS_VERSION_INFO` |
| Cockpit Tools | external-ui (tauri) | — | — | not located |
| Tuanjie Cowork | external-ui (tauri) | — | — | not located |
| BCompare | green | `E:\Beyond_Compare_4.4.6.27483_64bit_Green\BCompare\BCompare.exe` | 4.4.6.27483 | `VS_VERSION_INFO` |
| Apifox | green | `E:\Apifox\Apifox.exe` | 2.7.8 | `VS_VERSION_INFO` |
| Burp Suite | green | — | 2026.4.3 | not located |
| choco | choco | `C:\ProgramData\chocolatey\bin\choco` | 2.2.2 | `choco --version` |

`npm ls -g --json` reports exactly 26 globally installed packages; the ones Upkeep tracks are the `npm-global` entries in [config/apps.yaml](../config/apps.yaml). The machine registry holds roughly 793 uninstall entries — Upkeep manages only the applications a user adds to the registry and never scans the whole machine.

Nine Chocolatey packages are upgrade-pending as of the measurement: `chocolatey` 2.2.2 → 2.7.4, `python` and `python3` 3.11.4 → 3.14.7 (`python311` 3.11.9), `vcredist140` 14.32.31332 → 14.51.36247, `visualstudio2019buildtools` 16.11.17 → 16.11.60, `visualstudio-installer`, `chocolatey-visualstudio.extension`, and `chocolatey-windowsupdate.extension`.

### Version sources confirmed

| App | Source | Confirmation |
|---|---|---|
| omp | `omp update --check` | The flag exists (`-c, --check`); the command is the tool's own check, so the version comes from GitHub release metadata through the tool |
| PiDeck | `github:ayuayue/PiDeck` | `releases/latest` → `v0.7.6`, which normalizes to the installed `0.7.6` — the `v` prefix is a tag convention, not part of the version |

Any source not in this table is still `# TBD` in the registry and renders as `unknown`.

## Update residue

| Source | Path pattern | Measured |
|---|---|---|
| Tauri updater | `%TEMP%\<App>-<ver>-updater-<rand>` | 52 directories / 430,106,808 bytes (CC Switch, Cockpit Tools, Tuanjie Cowork, Clash Verge, Quark) |
| electron-updater | `%LOCALAPPDATA%\pi-desktop-updater\` | 262,644,841 bytes |
| Runtime natives | `%USERPROFILE%\.omp\natives\<ver>\` | 179,461,632 bytes, currently all belonging to the installed 18.2.4 — nothing stale to reclaim today |
| Self-update backup | `%LOCALAPPDATA%\omp\omp.exe.*.bak` | none present; the directory holds only the 212,003,328-byte `omp.exe`, so a backup appears only across an update |
| Squirrel | `%LOCALAPPDATA%\SquirrelTemp` | 87,201 bytes |

The reclaimable total therefore changes with the update history, and a rule whose target currently matches nothing must report `0` rather than being treated as broken. `%LOCALAPPDATA%\com.ccswitch.desktop` is CC Switch's application data directory, not updater residue; whether it holds only cache or also configuration is unresolved, and it stays out of every rule until someone inspects it and records the finding here.

## Proxy behaviour by tool

The system proxy is `ProxyEnable=1`, `ProxyServer=127.0.0.1:10808` (xray). The port can change when the xray process restarts, so every component reads it per run rather than storing it.

| Tool | Reads the system proxy | Observed result |
|---|---|---|
| .NET (`Invoke-WebRequest`, `HttpWebRequest`) | yes | 161 MB downloaded in 12.7 s through the proxy |
| `gh` | no | fails with `error connecting to http` until `HTTPS_PROXY` is exported; authenticated as account `JESVN` with a keyring token |
| `omp` (Bun fetch) | no | direct GitHub fetch times out at its own 15-minute limit → [postmortem 0001](postmortem/0001-omp-update-timeout-and-proxy.md) |
| `curl` | no | returns `HTTP=000` both direct and through the proxy — unusable as a probe |
| `rustup`, `cargo` | no | download from `static.rust-lang.org` and `crates.io`; need `HTTPS_PROXY` per process or a mirror |

Upkeep's own HTTP reads the registry and builds its client with an explicit proxy; it never relies on ambient inheritance and never writes the registry.

## Toolchain and prerequisites

| Prerequisite | State |
|---|---|
| MSVC linker | VS 2022 Community (MSVC 14.44) + VS 2019 BuildTools (14.29) |
| Windows SDK | 10.0.19041, 22621, 26100 |
| WebView2 runtime | 153.0.4234.32 |
| Node / npm | v24.18.0 / 12.0.0 |
| Disk | G: 127 GB free (a Rust build tree costs 3–5 GB) |
| Rust toolchain | not installed — M0 installs rustup (~1.5–2 GB) |

## Re-measuring

Run the probe, not a memory of the number, and update the table in the same change:

- Application versions — `omp --version`, `npm ls -g --json`, `choco outdated --limit-output`, or the executable's `VersionInfo.FileVersion`.
- Residue sizes — `Get-ChildItem <pattern> -Recurse -Force -File | Measure-Object Length -Sum`, then sum; record bytes, not a rounded megabyte figure.
- Proxy — read `ProxyEnable` and `ProxyServer` from `HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings`.
- Reachability per tool — one timed request per row, recording bytes and seconds, because the ETA guard depends on plausible throughput rather than on `HTTP 200`.
