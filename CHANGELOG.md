# Changelog

All notable changes to this repository are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates come from
`catalog.json` `assessedOn` and from `git log` for commits that touched
`catalog.json`. Project identifiers match the `id` field in `catalog.json`.

## [Unreleased] - 2026-09-18

### Added
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