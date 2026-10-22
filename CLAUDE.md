@AGENTS.md

## Release notes

Write release notes **only when the user asks for them**. Do not add them on your own
alongside a code change; when the work is done, leave the README alone unless told to.

When asked, each change that users see (storefront/admin) or that changes the API
(backend) gets one line under `### Unreleased` in `## Release Notes` of this project's
`README.md`. Write it for the people who use the product — what changed and where, not
file names — under Added, Changed or Fixed. Skip pure refactors and formatting.

Do not bump `package.json` or rename Unreleased while working; that happens only when a
release is cut with `/release` (`.claude/commands/release.md`), which also documents the
versioning rules.

Keep the README's Installation section accurate too: when a change adds a script, an env
variable, a port or a setup step, update it in the same change.
