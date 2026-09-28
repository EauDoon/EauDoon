# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates come from
`catalog.json` `assessedOn` and from `git log` for commits that touched
`catalog.json`. Project identifiers match the `id` field in `catalog.json`.

## [Unreleased] - 2026-09-18

### Changed
- `node scripts/links.mjs` now checks every Markdown file in the repository
  instead of a fixed list of four. `CHANGELOG.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, the issue and pull-request templates and the `audits/` notes
  are covered, and a new document is picked up without editing the script.
  `lib/links.mjs` exports the walk as `markdownFiles`.

### Fixed
- Catalog `summary`, `boundary`, and `assessment`, and saved query text, reject
  Unicode line and paragraph separators. U+2028 in a summary validated and was
  copied into a catalog-guide table cell. Newlines were already rejected.
- Snapshot added, removed, and changed ids use the catalog's case-insensitive
  id order. Code-unit sort listed `EauDoon` before `agent-action-stack`.
- The drift detector treats project ids as case-insensitive. `Fixture-A` and
  `fixture-a` were not reported as duplicates, even though search, diff, and
  validation treat that pair as one id.
- Importing `scripts/drift.mjs` no longer runs the drift check. Loading the
  module parsed `process.argv`, printed a report, and would set a failing exit
  code once `assessedOn` aged past the limit. `node scripts/drift.mjs` is
  unchanged.
- The UTF-8 guard now checks `LICENSE`. The walk compared file extensions to
  the string `LICENSE`, so the extensionless license was never read and a
  UTF-16 copy would have passed.
- Page cursors use the catalog receipt identity. Reordering projects or object
  keys invalidated `next` even though the page contents were unchanged. A real
  content change still invalidates the cursor.
- The link checker reads CommonMark inline destinations. An angle-bracket
  destination was checked as a literal filename, so a link to an existing file
  was reported missing. A destination followed by a title was ignored, and an
  empty destination was accepted.
- A whitespace-only `search` or saved-query `text` is rejected. Spaces, a
  non-breaking space, or a line separator previously trimmed to no words and
  matched every project with exit code 0. An omitted or empty query text is
  still an unconstrained brief.
- `node scripts/drift.mjs --today` rejects a value that is not a real
  `YYYY-MM-DD` date. `not-a-date` and `2026-02-31` previously skipped the age
  check and printed `no drift detected.`
- `node scripts/diff.mjs` and `cli.mjs impact` now report a change to
  `portfolioWavesCompleted` or `schemaVersion`. Previously only `assessedOn`
  and `assessment` were compared, so a completed portfolio wave could be added,
  removed, or reordered and the review still said metadata was unchanged.
- `lib/catalog.mjs` now rejects `summary`, `boundary` and `assessment` values
  that are only whitespace. They previously validated and rendered as an empty
  Purpose cell and an empty Limit paragraph in `docs/CATALOG.md`.
- An argument beginning with a single `-` is now rejected as `Unknown option`
  instead of being treated as a search word or project id. `node cli.mjs search
  -jsno` previously printed `No projects match.` and exited 0.
- `node scripts/diff.mjs` and `cli.mjs impact` now report a field that was
  dropped from a retained project. Previously only fields still present in the
  newer snapshot were compared, so a deleted `source` pin, `boundary` or
  `lastAudited` value was reported as "no change".
- A UTF-16 catalog is now rejected as an encoding fault instead of being
  reported as `Invalid JSON input`. UTF-16LE bytes decode as valid UTF-8 (NUL is
  a legal code point), so only a UTF-16 file carrying a BOM was previously
  recognised.

### Added
- `node scripts/drift.mjs --check` reports per-project audit coverage
  (`audited=12/15`) and names the entries with no `lastAudited` date. The
  `--json` report already carried `projectsWithAudit`; the human-readable
  summary line did not, so the gap was invisible outside the artifact.
- `SECURITY.md` describing the private vulnerability reporting flow for this
  static profile repository.

### Changed
- `package.json` `private` flag flipped from `true` to `false` so the
  provenance catalog is publishable.

## [2026-09-11] - Catalog refreshed against reviewed public releases

### Changed
- Catalog `assessedOn` set to 2026-09-11.
- All project entries refreshed to source-bound revision pins against reviewed
  public releases (commit 77561ca).
- MandateBound operator validation repair pinned to its final reviewed revision
  (commit 7dcb928).

## [2026-09-10] - Catalog reconciled with reviewed product releases

### Changed
- Catalog reconciled with reviewed product releases; site rendering and search
  fixes pinned to reviewed revisions (commits 83bb6df, c587dc7).

### Added
- Public inventory snapshot comparison and discoverable project reconciliation
  (commit 436fc6f).

## [2026-09-09] - Initial provenance-pinned public project catalog

### Added
- First version of `catalog.json` with 15 provenance-pinned entries
  (commit 441dfa1). The following projects were introduced in this release:
  - `agent-action-stack`
  - `agent-team-os`
  - `connect.md`
  - `consequence-rail`
  - `constitutional-agent-testbench`
  - `crypto-research-desk`
  - `decision-labs`
  - `EauDoon`
  - `hermes-agent`
  - `hermes-parallel-followups`
  - `llms-txt-personal-site`
  - `mandatebound`
  - `operator-labs`
  - `reflection-engine`
  - `unconventional-moves`

## Notes

- Dates prior to 2026-09-09 cover pre-catalog portfolio and profile work that
  pre-dated the provenance catalog. See `git log` for the full history.
- This changelog tracks the catalog and repository metadata. It does not
  release-version the projects listed in `catalog.json`; those projects track
  their own changes in their own repositories.