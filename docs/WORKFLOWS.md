# Repeatable project discovery

These offline commands print JSON for inspection or redirection. They never query accounts or run a project. All input files use UTF-8 JSON, reject duplicate object members and share the regular-file 1 MiB limit. Existing discovery commands are unchanged.

Use `node cli.mjs help export` or `node cli.mjs export --help` for a command's argument order. Command help performs no catalog reads or output writes, so it remains available when a supplied snapshot is missing or invalid.

Malformed JSON errors do not echo source text. Output artifacts may include the normalized query you supplied, so review them before sharing.

JSON object and array nesting is limited to 64 levels before any digest or workflow processing. Brackets inside strings do not count. This applies to every supplied snapshot, query, receipt and handoff packet.

Prefix any command with `--catalog SNAPSHOT.json` to use a previously saved, validated catalog instead of this checkout's catalog. For example, `node cli.mjs --catalog SNAPSHOT.json receipt` reproduces that snapshot's receipt. Relative input and output paths resolve from your working directory. This reads supplied files only; it never retrieves source repositories. The `impact` command still uses its two explicit snapshots.

## Compare a public inventory

`node cli.mjs inventory PUBLIC-INVENTORY.json` compares a supplied public-only snapshot with the assessed catalog. It lists catalog entries absent from that snapshot and public ids that need assessment. It never infers why a name is absent or changes the catalog.

Input shape: `{"owner":"EauDoon","repositories":[{"id":"example-project","public":true}]}`. Every row must explicitly be public. Supply a complete public-only inventory for a complete comparison; the tool does not authenticate its completeness or truth. Keep your source inventory outside the repository. Do not supply private records.

## Save a discovery brief

`node cli.mjs save-query NEW-QUERY.json synthetic payment --runtime python` saves the same search and single-value filters used interactively as a normalized brief. Omit words and filters to save an unconstrained brief. It validates before writing, never replaces a file, and returns the saved query for review. Edit the JSON to add multi-value filters or explicit exclusions. The saved brief works with query, facets, page, plan, export and handoff.

`node cli.mjs query docs/examples/local-evidence.query.json` runs a reusable query. Copy [the example](examples/local-evidence.query.json) outside the repository to adapt it. A query requires `version: 1`; optional `text`, `filters` and `exclude` default to empty. Text retains the existing all-words search behavior.

Filters accept arrays: `runtime`, `category`, `privacy`, `task`, and `fork` (`yes`/`no`). Values within one field are alternatives (OR); different fields intersect (AND). Empty arrays impose no constraint. `exclude` removes exact ids case-insensitively, even if an id is absent from the current snapshot. Unknown fields, unsupported values and duplicate values fail. Results echo the normalized brief so exclusions and selection logic remain inspectable.

## Evaluate a set of briefs

`node cli.mjs batch BRIEFS.json` evaluates 1 to 20 named briefs against one catalog. Input: `{"version":1,"queries":[{"id":"payments","query":{"version":1,"text":"synthetic payment"}}]}`. Ids must be unique case-insensitively. All briefs validate before any result is printed. Output preserves input brief order, each normalized query and digest, stable matching ids, empty-result count and the catalog digest. An empty result is valid and explicit; malformed entries fail the entire request. Nothing is saved or run.

## See available filter choices

`node cli.mjs facets QUERY.json` shows query-specific counts for runtimes, categories, privacy labels, task tags and fork status, including zero-count choices. Each count means replacing that field with the named value while preserving all other filters, text and exclusions. A selected flag records the current brief; the command does not change it. Counts describe catalog matches, not compatibility or quality.

## Read results a page at a time

`node cli.mjs page QUERY.json 5` returns up to five projects in stable id order, total count and `next`/`previous` cursors. Pass the returned cursor as the third argument to move pages. Sizes from 1 to 100 are accepted. A cursor is tied to the exact catalog content, normalized brief and page size; changing any of those requires starting again. Cursors are navigation hints, not signatures or authorization tokens. No result state is stored on disk.

## Find complementary projects

`node cli.mjs coverage QUERY.json TASKS.json` shows every selected project's declared coverage of your requested tasks before choosing a combination. It accepts the same 1 to 10 known task ids as `plan`, retains requested task order, and lists each task's matching project ids and missing tasks. Selected source links and boundaries remain available for review. At most 100 projects are accepted; empty selections explicitly leave every task uncovered. This matrix does not establish that projects integrate.

`node cli.mjs plan QUERY.json docs/examples/evidence.tasks.json 3` searches combinations of up to three matching projects for the [requested task set](examples/evidence.tasks.json). It prefers the most declared task coverage, then fewer projects, then stable id order. Missing tasks stay explicit. Unlike `shortlist`, it considers coverage across a group rather than ranking projects individually.

The search is bounded to 25 relevant candidates, 10 known tasks and a maximum of 1 to 4 projects. Narrow the query if too many candidates remain. This is catalog set coverage, not proof that packages integrate, are compatible, or are appropriate to deploy. No code is executed and no task is authorized by a plan.

## Export a selection

`node cli.mjs export QUERY.json csv NEW-FILE.csv` writes the selected rows for a spreadsheet. `json` preserves the complete result and normalized query; `markdown` produces a shareable comparison table. Every format retains assessment provenance and project limits. CSV quotes every cell and prefixes formula-like leading characters with an apostrophe; spreadsheet import settings can still affect display.

The destination must not exist, its parent must already exist, and output is limited to 4 MiB. Existing files and symlinks are never replaced. A disk failure can leave an incomplete newly created file; an error never reports successful export. Review the output before sharing, especially query text that may contain your own context.

Use `ndjson` to consume an export one JSON record per line. The first record has `kind: "selection"`, assessment metadata, normalized query and total count. Each following `kind: "project"` record contains a complete `project`, including source and boundary. An empty selection still emits its metadata record. Generation is bounded in memory by the same catalog and output limits.

## Record the assessed catalog

`node cli.mjs receipt` prints a semantic SHA-256 receipt with the assessment date and every pinned source revision. Save its JSON and retain the digest separately if you need a substitution check. `node cli.mjs verify-receipt RECEIPT.json EXPECTED-DIGEST` verifies it against this checkout and the independently retained digest. Omitting the digest checks only consistency with this checkout and explicitly reports `independentlyPinned: false`.

The digest ignores object-key and project ordering; other array ordering remains significant. It binds summaries, limits, classifications and source revisions, not just project names. A matching receipt is not a signature, authentic source, live-availability check or endorsement. Editing both an unanchored catalog and its receipt can produce another internally consistent pair.

## Review how an update affects your brief

`node cli.mjs impact BEFORE.json AFTER.json QUERY.json` applies the same brief to two validated catalog snapshots. It reports entering, leaving and retained matches, changed fields within retained matches, metadata changes and both digests. A task present only in the older snapshot remains a constraint, so its disappearing matches are visible. Unknown task tags absent from both snapshots still fail validation. Nothing is promoted or overwritten.

## Hand off a selection for review

`node cli.mjs handoff QUERY.json NEW-PACKET.json` creates a self-contained readable packet with the normalized query, complete matching project records, pinned source links, review steps and an explicit no-execution authority boundary. Keep the reported digest separately. The packet must contain 1 to 100 projects and uses the same exclusive-output rules as exports.

`node cli.mjs verify-handoff PACKET.json EXPECTED-DIGEST` checks that retained digest, the entire packet and the selection reconstructed from this checkout's catalog. It rejects stale catalogs, omitted matches and changed instructions even if an internal digest was recomputed. Verification needs the matching catalog snapshot; reading the packet does not. A digest taken from the same untrusted packet is not an independent trust anchor. No signer identity, factual claim or external action is authenticated.

## Understand an empty result

`node cli.mjs diagnose QUERY.json` reports which constraints each near miss fails and what would match if one text/filter constraint were omitted. It preserves explicit exclusions in every diagnostic and never edits or reruns a broadened request automatically. At most 50 near misses are shown, ordered by failed-constraint count then id, with the total stated. This explains selection mechanics, not project quality or a recommendation to relax your requirements.

CLI file errors report a stable reason without disclosing the supplied path. Unknown project ids and options are not echoed, including terminal control characters. Existing output files remain untouched on failure.
