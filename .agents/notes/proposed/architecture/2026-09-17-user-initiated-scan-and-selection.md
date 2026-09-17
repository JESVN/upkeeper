# Agent Note: Scan and update are user-initiated — no startup scan, no pre-ticked rows

Status: proposed

## Problem

The v0.1 draft left the trigger implicit, and three places implied work happening on its own. The UI mock showed two rows already ticked (`☑ omp`, `☑ pi`), the six-panel list offered a `[全部更新]` button, and §5.1 justified writing results to `state.json` by "avoiding frequent API calls" without ever saying who starts a scan.

Implicit triggers are the wrong default for this tool. Opening a window would become a network event — requests to the npm registry and the GitHub API — plus a batch of `<cli> --version` child processes, none of which the user asked for. And a pre-ticked row turns a deliberate decision into a one-click accident: the tick is the user's statement of intent, so filling it in on their behalf removes exactly the control this project exists to provide. The comparison table in [DESIGN.md](../../../../DESIGN.md) lists tools that already behave this way; the point of Upkeep is to be the opposite.

## Proposal

**Scanning is user-initiated only.** The `scan` command is the sole trigger: not launch, not a focus change, not a timer, not a background task. Launching the application reads `state.json` and renders it with the age of its `checked_at`; a machine that has never scanned shows an empty list with one `[检查更新]` prompt. Until the user asks, Upkeep makes no outbound request and spawns no child process.

**Update targets are user-selected.** A finished scan ticks nothing. `[全选可更新]` ticks boxes and never executes; `[更新选中]` runs exactly the ticked rows; a row's own `[更新]` runs that row through its preview. An update target the user did not choose does not exist. Cleanup keeps the same shape, starting with no rule selected.

**Notifications follow a user-initiated action.** `settings.notify` reports the settlement of a run the user started. There is no background discovery, so there is nothing that could notify on its own.

Registry-read and per-child proxy injection are unaffected: they still happen on every run, but only for a run the user started.

**A row can be re-probed on its own.** `[刷新]` runs `scan { apps: [<id>] }`: one provider, no others, and the remaining rows keep their recorded values and `checked_at`. A failed row's `[重试]` is the same action under a failure-specific label, so there is exactly one way to refresh a row.

## Alternatives considered

- **Scan on launch, render the cache immediately, refresh in the background.** Rejected: it makes opening the app a network event and hides the tool's own cost, which is the one thing this project is meant to make visible. It also creates two states for the same row a moment apart, which the UI then has to explain.
- **Periodic background check with a "new version available" toast.** Rejected. It needs a scheduler, a quiet-hours policy, and a stable AppId for an unprompted toast; the behaviour it produces is the reason this project exists rather than an extension of the tools already installed.
- **Pre-tick the rows that can update unattended.** Rejected as a *default*, while keeping selection cheap: `[全选可更新]` is one click and does not execute anything. The difference is that the user's intent is explicit rather than assumed.
- **A `scan_on_start: false` setting that defaults to off.** Rejected. A tunable would let a later change flip a property into a preference, and nothing in the code should be able to scan unprompted — not even if configured to.
- **Refresh every row whenever one row is refreshed.** Rejected: a stale row is a local question about one application, and re-probing all of them to answer it turns the cheapest action into the most expensive one.

## Acceptance criteria

- **M1** — launching the built application creates no child process and makes no outbound request; the list renders the recorded state and its age; a never-scanned machine shows the empty state and its prompt; a single-row refresh runs that application's provider alone and leaves the other rows' recorded state untouched.
- **M2** — a row with an available update stays unticked until the user ticks it; `[全选可更新]` ticks without executing; `[更新选中]` updates exactly the ticked rows and leaves the others untouched.
- **M1/M4** — a settled run raises the notification; nothing else does.

Evidence requirements live in [docs/testing.md](../../../../docs/testing.md), the panel and interaction rules in [docs/ui.md](../../../../docs/ui.md#interaction-rules), and the scan contract in [docs/architecture.md](../../../../docs/architecture.md#scan).

## Risks

- **The list can be arbitrarily stale**, so a `待更新` badge may be wrong by the time it is read. Mitigated by showing the `checked_at` age beside the list and by re-reading the version after every update (`verify`). The badge is a claim about a recorded observation, and the age is what makes it honest.
- **A user who wants an unattended check will have to ask for it**, and that request has to argue against this note rather than being switched on quietly.
- **First run is an empty screen.** Accepted for a single-user console; the prompt makes the one required action obvious, and nothing is fetched to fill it in.
