# Repeatable project discovery

These offline commands print JSON for inspection or redirection. They never query accounts or run a project. All input files use UTF-8 JSON, reject duplicate object members and share the regular-file 1 MiB limit. Existing discovery commands are unchanged.

## Compare a public inventory

`node cli.mjs inventory PUBLIC-INVENTORY.json` compares a supplied public-only snapshot with the assessed catalog. It lists catalog entries absent from that snapshot and public ids that need assessment. It never infers why a name is absent or changes the catalog.

Input shape: `{"owner":"EauDoon","repositories":[{"id":"example-project","public":true}]}`. Every row must explicitly be public. Supply a complete public-only inventory for a complete comparison; the tool does not authenticate its completeness or truth. Keep your source inventory outside the repository. Do not supply private records.

## Save a discovery brief

`node cli.mjs query docs/examples/local-evidence.query.json` runs a reusable query. Copy [the example](examples/local-evidence.query.json) outside the repository to adapt it. A query requires `version: 1`; optional `text`, `filters` and `exclude` default to empty. Text retains the existing all-words search behavior.

Filters accept arrays: `runtime`, `category`, `privacy`, `task`, and `fork` (`yes`/`no`). Values within one field are alternatives (OR); different fields intersect (AND). Empty arrays impose no constraint. `exclude` removes exact ids case-insensitively, even if an id is absent from the current snapshot. Unknown fields, unsupported values and duplicate values fail. Results echo the normalized brief so exclusions and selection logic remain inspectable.

## See available filter choices

`node cli.mjs facets QUERY.json` shows query-specific counts for runtimes, categories, privacy labels, task tags and fork status, including zero-count choices. Each count means replacing that field with the named value while preserving all other filters, text and exclusions. A selected flag records the current brief; the command does not change it. Counts describe catalog matches, not compatibility or quality.

## Read results a page at a time

`node cli.mjs page QUERY.json 5` returns up to five projects in stable id order, total count and `next`/`previous` cursors. Pass the returned cursor as the third argument to move pages. Sizes from 1 to 100 are accepted. A cursor is tied to the exact catalog content, normalized brief and page size; changing any of those requires starting again. Cursors are navigation hints, not signatures or authorization tokens. No result state is stored on disk.
