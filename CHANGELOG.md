# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). From 1.0.0 the
repository follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html),
and the `version` field in `package.json` is the only version source. Sections
headed `(pre-versioning)` are dated history from before the first release; they
carry no version and no tag. Dates come from `catalog.json` `assessedOn` and
from `git log` for commits that touched `catalog.json`. Project identifiers
match the `id` field in `catalog.json`.

## [Unreleased]

### Added
- `stable-desk` is catalogued as an owned project (d590d35).
- `public-inventory.json` records a dated public non-fork inventory (retrieved
  2026-10-02) with explicit exclusions, and `scripts/inventory-check.mjs`
  compares the catalog against it. `npm run check` and `drift.yml` run the
  check, and `docs/DISCOVERY.md` documents the refresh procedure (d590d35).
- The profile shows a project constellation and three project cards
  (`mandatebound`, `decision-labs` and `hermes-parallel-followups`), each in
  light, dark and mobile variants. The constellation animation stops under
  `prefers-reduced-motion` (eeed045, 0ebebbe).
- `npm run coverage` runs the test suite with coverage thresholds of 95%
  lines, 85% branches and 90% functions, and CI runs it on the Ubuntu and
  Node 24 job. New tests run the documented paths that no test reached: the
  human `show` output, the text report of `node scripts/diff.mjs`, the exit
  codes of `node scripts/inventory-check.mjs` on a snapshot dated today, and
  drift's empty-catalog issue.

### Changed
- The profile README restores the original banner, simplifies the
  introduction, and adds the constellation and a collapsible project index
  (efb2b22, eeed045).
- Profile artwork font sizes are reduced by one-third and the typography is
  rebalanced (a334c05, 0ebebbe).
- `docs/CATALOG.md` lists owned projects and forks in separate tables
  (d590d35).
- Twelve owned project source pins and the `connect.md` middleware citation in
  `docs/DISCOVERY.md` are refreshed to reviewed revisions (26c6a49).
- `agent-team-os` is re-assessed against its slimmed README: its summary,
  boundary, `lastAudited` and source pin (`39c45d2`) are updated, and
  `catalog.json` `assessedOn` moves to 2026-10-04 (d067b90).
- `SECURITY.md` scope describes the offline CLI and lists parser,
  path-handling, resource-limit and output-overwrite bugs as in scope
  (d590d35).
- `CONTRIBUTING.md` records the portfolio license and copyright policy, and the
  `LICENSE` copyright holder is normalised to match it (914b564).
- CI runs on the Node 24 majors of `actions/checkout` (v7.0.1),
  `actions/setup-node` (v7.0.0) and `actions/upload-artifact` (v7.0.1), still
  pinned by commit SHA, so jobs no longer warn about the deprecated Node 20
  action runtime. A newer push to a pull request cancels its superseded runs;
  runs on `main` are never cancelled. `drift.yml` watches the same paths on
  push and pull request, including all of `lib/` and the workflow itself, and
  writes `drift-report.json` through bash on every OS. Dependabot proposes one
  grouped weekly update to the action pins.
- `node scripts/drift.mjs` usage errors exit 2 instead of 1 and print the
  usage line: an unknown argument, an option with no value, and a repeated
  option. An invalid `--today` or `--max-age-days` value still exits 1.
  `--help` prints the usage line and exits 0. `docs/DISCOVERY.md` and
  `CONTRIBUTING.md` state that the drift and inventory checks compare UTC
  calendar dates.
- The profile banner honours `prefers-reduced-motion`: the sweep, the pulse
  ring and the pulsing dot are hidden and a static dot is shown, while default
  motion is unchanged. Its footer meets WCAG AA contrast (light 2.58:1 to
  4.97:1, dark 3.93:1 to 5.39:1), and both variants carry a `<title>` equal to
  their `aria-label`, like the other artworks. A new test pins the accessible
  name, title, reduced-motion handling, text contrast and dark/light text
  parity of every `assets/*.svg`.

### Removed
- The `EauDoon` profile entry in `catalog.json`. The profile is presentation
  infrastructure, not a project, and is now an exclusion in
  `public-inventory.json` (d590d35).

### Fixed
- `node scripts/drift.mjs` rejects an `assessedOn` later than the reference
  date in both text and JSON modes. A future-dated assessment previously
  skipped the age check (26c6a49).
- The link checker skips fenced code blocks, inline code spans, HTML comments
  and GitHub footnote definitions, none of which GitHub renders as a link. A
  documentation example such as `[x](not-a-real-file.md)` in a code block, or
  any footnote, previously failed `npm run check`. A query string is ignored
  when resolving a local target, so `docs/CATALOG.md?plain=1` is no longer
  reported missing. `CONTRIBUTING.md` now describes the full scope.
- `node scripts/drift.mjs --today YYYY-MM-DD` without a mode runs the check,
  as the usage line always promised; it previously exited with the usage
  line. `--today` with no value reports a missing value instead of an unknown
  argument, and a repeated option is rejected instead of the last value
  silently winning.
- `node scripts/drift.mjs` no longer echoes an unknown argument, so a terminal
  escape sequence in an argument cannot reach stderr.
- Public inventory exclusion reasons reject Unicode line and paragraph
  separators, as catalog text already did.
- Two drift tests passed only until 45 days after their fixture's
  `assessedOn` and would have failed `npm test` from 2026-11-08. They now pin
  the reference date.

### Security
- The link checker reads HTML `href`, `src` and `srcset` attributes in any
  letter case and with double, single or no quotes. A credentialed or
  `javascript:` link in a single-quoted or uppercase `HREF` attribute, and an
  unquoted or empty `src`, previously passed unchecked in the raw-HTML profile
  README. Each `srcset` candidate is checked separately, so a valid
  `1x, 2x` list is no longer reported missing, and `data-src` attributes or
  prose that mentions an `href` outside a tag are no longer read as links.

## 2026-09-29 (pre-versioning)

### Added
- `gauntlet-verify` is catalogued. The repository is featured in the profile
  README but had no `catalog.json` entry, so it was absent from every generated
  view. Classification is taken from the repository itself: a Claude skill
  (`.claude/skills/gauntlet-verify`) with `node` and `python` tooling in
  `evals/` and `scripts/`, forked from `robonuggets/gauntlet-loop`, and pinned
  to README revision `4c0f066`. The `boundary` records the documented limits:
  isolated subagents, a browser or screenshot tool and web access are required,
  one full-formation round cost about 325k subagent tokens when measured, and
  enabling it alongside upstream `gauntlet-loop` can make both answer the same
  request.

### Changed
- `catalog.json` `assessedOn` moves to `2026-09-29` and `lastAudited` is recorded
  for `connect.md`, `hermes-agent` and `hermes-parallel-followups`, which were
  the three entries without one. Each was re-checked against its live repository
  before the date was written, and all three descriptions still hold:
  `connect.md`'s README names the browser Markdown builder as the active
  product with the network routes as separately configured optional extras, and
  `hermes-parallel-followups` still documents exactly one supported upstream
  snapshot. `drift.mjs` rejects a `lastAudited` newer than `assessedOn`, so the
  two dates had to move together.

### Fixed
- The drift test that asserts the report names entries with no `lastAudited` now
  holds in both directions. It compared the report against an empty string when
  the catalog had no gaps, while the report omits the line entirely, so `''`
  never equalled `undefined`. The report line is still checked exactly when gaps
  exist.

## 2026-09-18 (pre-versioning)

### Changed
- `node scripts/links.mjs` now checks every Markdown file in the repository
  instead of a fixed list of four. `CHANGELOG.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, the issue and pull-request templates and the `audits/` notes
  are covered, and a new document is picked up without editing the script.
  `lib/links.mjs` exports the walk as `markdownFiles`.

### Fixed
- Importing `scripts/diff.mjs` no longer runs the snapshot review. Loading the module parsed `process.argv`, printed a usage error, and set a failing exit code. `node scripts/diff.mjs` is unchanged.
- Drift audit dates must be real calendar dates. `2026-02-31` counted toward `projectsWithAudit`, and the string `9999` was reported as newer than `assessedOn` because it sorts later.
- `node scripts/drift.mjs --max-age-days` accepts only a plain decimal integer from 1 to 36500. `45.0`, `0x2d`, `045`, `+45`, and `1e2` were coerced by `Number` and could exit 0.
- `detectDrift` rejects a maximum age that is not a safe positive integer up to 36500 days. `0`, a fraction, and `1e21` previously became the 45-day default or disabled the age check, so a stale catalog could be reported as fresh.
- Snapshot changed-field lists follow schema order. Reversing object keys listed `boundary` before `summary` for the same edit.
- Saved query filters sort values case-insensitively. `['Zebra', 'apple']` was stored as `Zebra` then `apple`, so two briefs for the same tags did not share a normalized order.
- Task indexes and facet lists use case-insensitive catalog order. Code-unit sort put `Zebra` before `apple` and `gate-actions`.
- Catalog task tags are unique case-insensitively, matching project ids. `reflect` and `Reflect` on one project validated as two tags, so search, shortlist, and the task index could treat one tag as two.
- The link checker reads CommonMark reference definitions, including a destination on the following line. `[id]: https://user:secret@github.com` was ignored, while the same URL in an inline link or autolink was rejected. Missing and out-of-scope reference targets are rejected too.
- The link checker skips spaces, tabs, and one line ending between `(` and an inline destination. `[catalog]( docs/CATALOG.md)` was reported as an empty destination, so the real target was never checked.
- Public inventory comparison lists absent and unassessed ids in catalog id
  order. Code-unit sort put `EauDoon` before `agent-action-stack`.
- The link checker reads autolinks. A credentialed `https` autolink was
  accepted, while the same URL written as a Markdown link was rejected.
  Non-`https` autolinks are unsupported, matching inline links.
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

## 2026-09-11 (pre-versioning) - Catalog refreshed against reviewed public releases

### Changed
- Catalog `assessedOn` set to 2026-09-11.
- All project entries refreshed to source-bound revision pins against reviewed
  public releases (commit 77561ca).
- MandateBound operator validation repair pinned to its final reviewed revision
  (commit 7dcb928).

## 2026-09-10 (pre-versioning) - Catalog reconciled with reviewed product releases

### Changed
- Catalog reconciled with reviewed product releases; site rendering and search
  fixes pinned to reviewed revisions (commits 83bb6df, c587dc7).

### Added
- Public inventory snapshot comparison and discoverable project reconciliation
  (commit 436fc6f).

## 2026-09-09 (pre-versioning) - Initial provenance-pinned public project catalog

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
[Unreleased]: https://github.com/EauDoon/EauDoon/commits/main
