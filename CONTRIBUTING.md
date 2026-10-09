# Maintain the public discovery catalog

This repository is a GitHub profile with a small offline discovery CLI. Preserve the introduction, identity links and original fork attribution. The catalog's job is to help readers find and compare public projects using stated tasks and limits.

## Update evidence before copy

1. Check the public repository's current main revision and read the relevant README and source. Use only public repositories. Do not use private account inventory or credentials to enrich the profile.
2. Review changes since the catalog's pinned revision. A new commit is not proof of a feature, a successful deployment or a privacy guarantee. If source and documentation conflict, record the uncertainty and link the relevant source in the discovery guide.
3. Edit `catalog.json`. Keep the schema version, exact public owner URL, immutable 40-character revision, source README link, concise purpose, task tags, runtime categories and authority/data limits. Confirm fork status from public provenance. Dates use the required JSON `YYYY-MM-DD` format; generated prose uses `DD-MM-YYYY`. Write `assessedOn`, `lastAudited` and `retrievedOn` as UTC calendar dates: the drift and inventory checks compare them with today's UTC date, so a local date that is already ahead of UTC fails as later than the reference date.
4. Review the old and candidate JSON with `node scripts/diff.mjs BEFORE.json AFTER.json`. Review removals, boundary changes and source changes individually. Never fill unavailable fields with a plausible guess.
5. Regenerate `docs/CATALOG.md` with `node scripts/render.mjs --write`. Update curated README text only when it materially changes the reader's understanding. Keep machine-readable and human-facing claims consistent.
6. Run `npm run check`, inspect the full diff, and preview the Markdown on GitHub or in a Markdown renderer. Check banner assets, table readability, source links, fork labels and the setup path for a new visitor.

Do not edit the generated catalog guide directly. No package installation, secrets, live services, account connections or project execution are needed for local checks. CI performs the same checks on Node 22 and 24, Windows and Linux, with read-only repository permissions. Local validation does not establish that CI has run.

## Schema and validation contract

`lib/catalog.mjs` is the executable schema. Unknown fields, duplicate ids, unsupported categories, repeated task/runtime labels, invalid dates, unpinned source URLs, control characters and oversized inputs are rejected. Catalog files are limited to 1 MiB and 1,000 projects. The loader opens one read-only regular-file descriptor, reads at most the byte limit plus one sentinel byte, closes it on every path, and rejects invalid UTF-8. A nonblocking open allows POSIX FIFOs to be rejected without waiting for a writer. Concurrent growth cannot bypass the consumed-byte limit; this is not an atomic snapshot guarantee against concurrent in-place edits. Tests cover descriptor growth and nonregular inputs, the CLI as a real subprocess, malformed input, search/filter behavior, task gaps, snapshot diffs and generated-file parity.

The link checker reads every Markdown file in the repository: inline links, reference definitions, autolinks and HTML `href`, `src` and `srcset` attributes. It validates local file targets, path containment and basic external HTTPS syntax. Fenced code, inline code spans, HTML comments and footnote definitions are skipped, and a query such as `?plain=1` is ignored when resolving a local file. It does not perform network requests, authenticate remote availability, check every anchor or replace a full Markdown parser. Confirm remote links separately during source review. Do not turn a read-only check into an automatic catalog updater or publisher.

## Acceptance examples

```text
node cli.mjs list --fork yes --json
node cli.mjs search synthetic payment --json
node cli.mjs list --runtime python --privacy local-after-setup
node cli.mjs compare consequence-rail mandatebound
node cli.mjs shortlist replay-evidence gate-actions --json
node cli.mjs show reflection-engine
```

## Versioning and releases

The package follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). The `version` field in `package.json` is the only version source: `node cli.mjs --version` and the help header read it, and no other file repeats the number.

- MAJOR: a removed or renamed command, flag, exit code or JSON field, or a new catalog `schemaVersion` or a new query, batch, receipt or handoff format version.
- MINOR: a new command, flag, optional field or vocabulary value.
- PATCH: fixes, documentation and catalog data refreshes.

The data formats keep their own version numbers (catalog `schemaVersion`; query, batch, receipt and handoff `version`; the `sha256-key-sorted-json-v1` digest algorithm), independent of the package version.

Every pull request with a user-visible change adds a line under `## [Unreleased]` in `CHANGELOG.md` and leaves the version alone. `node scripts/version-check.mjs`, part of `npm run check`, requires a SemVer version, one `[Unreleased]` section above every release, release headings of the form `## [X.Y.Z] - YYYY-MM-DD` in descending order with link references, and a version that equals the newest release or is a prerelease above it.

To release:

1. In one commit, set `version` in `package.json`, rename `## [Unreleased]` to `## [X.Y.Z] - YYYY-MM-DD` with the UTC date, add a new empty `## [Unreleased]` above it, and update the link references at the end of the changelog.
2. Merge the pull request with a merge commit once every check is green.
3. Optionally dry-run the release workflow: `gh workflow run release.yml --ref main -f tag=vX.Y.Z`.
4. Tag the merge commit on `main` and push the tag: `git tag -a vX.Y.Z -m vX.Y.Z <merge-commit>` then `git push origin vX.Y.Z`.

The tag push runs `.github/workflows/release.yml`. It refuses a tag that is not on `main`, runs `npm run check`, checks the tag with `node scripts/version-check.mjs --tag vX.Y.Z`, and creates the GitHub Release with the changelog section as notes and the `npm pack` tarball plus `SHA256SUMS` attached. Nothing is published to npm, and historical commits are not retro-tagged.

## Portfolio license and copyright policy

The portfolio applies a single rule across its public repositories, written
here so it does not drift per repo.

**Default license: MIT.** MIT is the default for any new public repository
unless the rule below says otherwise.

**Exception: Apache License 2.0** is used for repositories that handle signed
evidence, settlement receipts, recourse-gated execution, or policy evaluation
that gates actions. The current Apache-2.0 cluster is:

- `agent-action-stack` (orchestrates the cluster)
- `consequence-rail` (recourse-gated execution)
- `mandatebound` (evidence readiness)
- `constitutional-agent-testbench` (policy evaluation that gates actions)

The patent grant in Apache-2.0 is the reason this cluster uses it; consumers
who run policy evaluation or evidence handling downstream benefit from the
explicit patent license. Move a repo into this cluster only when its README
names signed evidence, settlement receipts, recourse-gated execution, or
policy gating as a load-bearing claim.

**Exception: no license.** `stable-desk` is published publicly without a
license grant. Its README and `LICENSE` file both state that public
visibility does not imply a reuse, redistribution, modification, or
attribution right. Treat this as the third license class in the portfolio,
not an oversight.

**Copyright string: `Copyright (c) 2026 EauDoon`** for every owned
repository, regardless of the license family above. Personal-name forms
(`Copyright (c) 2026 Daniel Oon`, `Copyright (c) 2026 Daniel Oon
(danieloon.ai)`) are retired. Upstream attributions in derivative works
remain in place and are not affected by this rule.

**How to add a new repository.** New public repositories inherit MIT and
the `Copyright (c) 2026 EauDoon` string by default. Re-license to Apache-2.0
only when the README names a load-bearing claim from the exception list
above. Add a `NOTICE` file when adopting Apache-2.0 so the project copyright
survives downstream NOTICE propagation. Add a `LICENSE` file with a
no-reuse-permission statement when adopting the no-license class.

**How to change an existing repository's license.** Treat a license change
as a public, irreversible event. Update `LICENSE` (and add `NOTICE` for
Apache-2.0), update the catalog entry's `boundary` and `lastAudited`, and
note the change in the repository's `CHANGELOG.md` Unreleased section.
