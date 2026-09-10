# Maintain the public discovery catalog

This repository is a GitHub profile with a small offline discovery CLI. Preserve the introduction, identity links and original fork attribution. The catalog's job is to help readers find and compare public projects using stated tasks and limits.

## Update evidence before copy

1. Check the public repository's current main revision and read the relevant README and source. Use only public repositories. Do not use private account inventory or credentials to enrich the profile.
2. Review changes since the catalog's pinned revision. A new commit is not proof of a feature, a successful deployment or a privacy guarantee. If source and documentation conflict, record the uncertainty and link the relevant source in the discovery guide.
3. Edit `catalog.json`. Keep the schema version, exact public owner URL, immutable 40-character revision, source README link, concise purpose, task tags, runtime categories and authority/data limits. Confirm fork status from public provenance. Dates use the required JSON `YYYY-MM-DD` format; generated prose uses `DD-MM-YYYY`.
4. Review the old and candidate JSON with `node scripts/diff.mjs BEFORE.json AFTER.json`. Review removals, boundary changes and source changes individually. Never fill unavailable fields with a plausible guess.
5. Regenerate `docs/CATALOG.md` with `node scripts/render.mjs --write`. Update curated README text only when it materially changes the reader's understanding. Keep machine-readable and human-facing claims consistent.
6. Run `npm run check`, inspect the full diff, and preview the Markdown on GitHub or in a Markdown renderer. Check banner assets, table readability, source links, fork labels and the setup path for a new visitor.

Do not edit the generated catalog guide directly. No package installation, secrets, live services, account connections or project execution are needed for local checks. CI performs the same checks on Node 22 and 24, Windows and Linux, with read-only repository permissions. Local validation does not establish that CI has run.

## Schema and validation contract

`lib/catalog.mjs` is the executable schema. Unknown fields, duplicate ids, unsupported categories, repeated task/runtime labels, invalid dates, unpinned source URLs, control characters and oversized inputs are rejected. Catalog files are limited to 1 MiB and 1,000 projects. The loader opens one read-only regular-file descriptor, reads at most the byte limit plus one sentinel byte, closes it on every path, and rejects invalid UTF-8. A nonblocking open allows POSIX FIFOs to be rejected without waiting for a writer. Concurrent growth cannot bypass the consumed-byte limit; this is not an atomic snapshot guarantee against concurrent in-place edits. Tests cover descriptor growth and nonregular inputs, the CLI as a real subprocess, malformed input, search/filter behavior, task gaps, snapshot diffs and generated-file parity.

The link checker validates local file targets, path containment and basic external HTTPS syntax in the profile and discovery guides. It does not perform network requests, authenticate remote availability, check every anchor or replace a full Markdown parser. Confirm remote links separately during source review. Do not turn a read-only check into an automatic catalog updater or publisher.

## Acceptance examples

```text
node cli.mjs list --fork yes --json
node cli.mjs search synthetic payment --json
node cli.mjs list --runtime python --privacy local-after-setup
node cli.mjs compare consequence-rail mandatebound
node cli.mjs shortlist replay-evidence gate-actions --json
node cli.mjs show reflection-engine
```

The first command currently returns two forks. The synthetic payment query returns Operator Labs. The shortlist places Consequence Rail first because it has both declared task tags, and lists missing tags for other matches. These are snapshot expectations, not permanent assertions about future catalog entries. Misspelled options and unknown ids must fail visibly instead of silently broadening the search.
