# Adding a provider

Use this when adding an application form, or a second implementation of an existing one. The contracts are in [providers.md](../providers.md); the field names are in [config-schema.md](../config-schema.md).

1. **Pick the form.** If one of the five fits, the change is a new config entry plus an implementation file — not a new trait method. If none fits, stop: a sixth form changes the UI grouping, the rollback matrix, and the trait contract, so it needs an [Agent Note](../../.agents/notes/README.md) before code.

   *Verify:* the form's detect, update, and rollback paths can all be described without a new `Provider` method.

2. **Write the provider file** at `src-tauri/src/providers/<form>.rs`. Keep the file header to the one non-obvious fact about the form (why the version command is what it is, or which flag makes it non-interactive).

   *Verify:* `cargo test providers::<form>` compiles and the file has no direct Win32, registry, or filesystem-write call.

3. **Implement the trait in the order of the contracts:** `detect` reads only; `latest` returns `None` rather than a guess; `plan` performs no I/O; `update` does exactly what the plan says; `cleanup_rules` returns what the config declares; `rollback` returns `Error::Unsupported` unless a real path exists.

   *Verify:* a unit test calls `plan` with a fake `Installed` and asserts the returned flags (needs proxy, needs admin, processes to close, rollback copy) without any child process starting.

4. **Parameterize from config, not from code.** Every path, argument, and regex comes from the app's `apps.yaml` entry. If the provider needs a value the schema cannot express, extend [config-schema.md](../config-schema.md) and its validation rules in the same change rather than embedding a constant.

   *Verify:* the provider compiles with two different `apps.yaml` entries of the same form and produces different plans.

5. **Register it** in `src-tauri/src/providers/mod.rs` alongside the others, and keep the registry free of per-app conditionals.

   *Verify:* the registry builds from a config that mentions only this app, with no other provider initialized.

6. **Add the app entry** to [config/apps.yaml](../../config/apps.yaml): `id`, `form`, `detect`, `latest`, `update` where the form drives it, `cleanup` when the app leaves residue. An unverified version source stays `# TBD` and follows [verifying-a-release-source.md](verifying-a-release-source.md).

   *Verify:* the app appears in a scan with a real version or an explicit `unknown`, never with a fabricated one.

7. **Test the failure paths**, not just the happy path: a missing executable returns `NotInstalled` (absent row), a probe timeout marks only this app `failed`, and a non-interactive child never waits on stdin.

   *Verify:* `cargo test` covers each of those three, and the timeout test asserts the other apps in the same scan still report.

8. **Update the docs** that the change made untrue: the form table in [providers.md](../providers.md) for a new form, the source table for a new `latest.kind`, and an Agent Note when the trait contract itself changed.

   *Verify:* every link touched by the change resolves, and the form appears in the UI with the correct badge and rollback label.
