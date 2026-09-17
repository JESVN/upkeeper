# Verifying a release source

A `# TBD` in [config/apps.yaml](../../config/apps.yaml) means nobody has confirmed where that application's versions come from. This procedure replaces the marker with an answer. The rule it serves is in [AGENTS.md](../../AGENTS.md): nothing unverified enters the registry, and an unverified source renders as `unknown` rather than as a guess.

1. **Prefer the source the installation already has.** An app installed from npm is checked against the npm registry; an app installed by Chocolatey is checked by `choco outdated`; a tool with its own `update --check` uses that. A GitHub feed is for applications that publish releases and nothing else.

   *Verify:* the chosen source resolves the same version the application's own tool reports for a version you already know.

2. **Start from the app, not from memory of its name.** Open the application's own update prompt, publisher field, or `package.json`/`app.info` to get the real repository or package identity, then confirm the repository exists and is the publisher's.

   *Verify:* `gh api repos/<owner>/<repo> --jq '.full_name, .description'` returns the expected project, and its description or homepage matches the application's vendor.

3. **Export the proxy for the probe command.** `gh` does not read the system proxy ([evidence](../environment.md#proxy-behaviour-by-tool)).

   ```powershell
   $proxy = (Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer
   $env:HTTPS_PROXY = "http://$proxy"; $env:HTTP_PROXY = $env:HTTPS_PROXY
   gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name, (.assets[].name)'
   ```

   *Verify:* the command returns a tag and at least one asset name, not an HTTP error.

4. **Check that the tag normalizes to the installed version format.** Strip a leading `v`, and note any suffix scheme (`-beta`, `-rc`) so version comparison does not treat a prerelease as newer than the installed release.

   *Verify:* the normalized latest tag equals the version the tool reports when the tool is already up to date, and is greater than the installed version when it is not.

5. **Confirm the release carries an artifact this machine can use** — a Windows x64 build, an npm package, or an installer for the right architecture. A feed whose only asset is a Linux binary is the wrong feed.

   *Verify:* the asset list contains a name matching the platform Upkeep supports, or the source is npm/choco and the check does not apply.

6. **Replace the marker in `apps.yaml`** with the resolved value, and nothing speculative: no guessed repo, no remembered URL. If step 2 or 3 did not confirm the identity, the entry keeps `# TBD`.

   *Verify:* validation passes, and the app's row in the UI shows a version rather than `unknown`.

7. **For a green application with only a download page**, the regex must capture a version this machine can compare, and the URL must be the vendor's own page. Green sources fail silently by design, so a broken regex is a bruised row, not a wrong update.

   *Verify:* the captured group equals the version shown on the page for the current release, checked by reading the page once by hand.

8. **Record the confirmation** in an [Agent Note](../../.agents/notes/README.md) when the identity was genuinely ambiguous (the same name exists in more than one repository, or the publisher differs from the vendor), so the next reader does not repeat the search. Otherwise the resolved config value is the whole record.
