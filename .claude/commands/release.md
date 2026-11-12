---
description: Cut a release — turn README "Unreleased" notes into a version and bump package.json
argument-hint: "[patch|minor|major]"
---

Cut a release for this project. Arguments: `$ARGUMENTS`

- A bump word (`patch`, `minor`, `major`) forces that bump; otherwise choose it (rules below).
- There is one project: the Rooq app in `rooq/` (storefront, admin and API together). Run
  from the workspace root or from inside `rooq/`; either way, release that app.

For the app:

1. **Collect the changes.** Read the `### Unreleased` section of its `README.md` (under
   `## Release Notes`). Then read `git log` since the last `vX.Y.Z` tag — or, with no tag,
   since the commit that set the current `package.json` version — and add anything
   user-facing (storefront/admin) or API-visible (`/api/v1`) that Unreleased is missing. Skip
   refactors, formatting and internal-only commits. If there is nothing to release, say so
   and stop.
2. **Choose the version** from the current `package.json` version. We are pre-1.0:
   - **minor**: any new feature, new endpoint or field, or behaviour change
   - **patch**: fixes only
   - **major**: only if the user asked (production launch or a breaking change)
3. **Write the notes.** Replace the Unreleased entries with a new
   `### vX.Y.Z — YYYY-MM-DD` heading (today's date), newest first. Group the entries under
   `#### Added`, `#### Changed`, `#### Fixed` (omit empty groups). Write each entry for the
   people who use the product: what changed and where, not file names. Call out
   migrations and new env variables. Put a fresh `### Unreleased` containing
   `_Nothing yet._` above the new version.
4. **Bump** `"version"` in `package.json` to the same number. Touch nothing else in
   the file.
5. **Report** the old → new version and the notes you wrote. Suggest
   `git commit -m "chore(release): vX.Y.Z"` and `git tag vX.Y.Z`, but do not commit,
   tag or push unless the user asks.
