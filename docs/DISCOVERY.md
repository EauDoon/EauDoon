# Find a project for the job

Browse the [catalog](CATALOG.md) on GitHub, or clone this public profile repository and run the offline CLI with Node.js 22 or newer. No package installation is needed. Commands work in PowerShell and Bash from this repository root.

```text
node cli.mjs list
node cli.mjs search synthetic payment
node cli.mjs list --runtime python --privacy local-after-setup
node cli.mjs show operator-labs
node cli.mjs compare consequence-rail mandatebound
node cli.mjs tasks
node cli.mjs shortlist replay-evidence gate-actions
```

`show` prints prerequisites categories, authority limits, the entry's last audit date, the assessed README and current setup instructions; `compare` adds a `lastAudited` row. Follow those repository-specific instructions after reviewing their requirements. The discovery CLI never clones, installs, launches or executes a catalog entry.

List, search and shortlist accept `--category`, `--runtime`, `--privacy`, and `--fork yes|no`. List and search also accept `--task`. Filters intersect. Each option can appear once. An invalid value prints the available choices. Search requires every supplied word to appear in the project's id, summary, category or task tags. Matching stays exact: no fuzzy matching is performed, and hints never change the results.

When a word of four or more characters finds no project, search suggests up to three close catalog terms (one edit away up to five characters, two from six, where swapping two adjacent letters counts as one edit), each with the number of projects it would find, so `search payments` suggests `payment`. When a word names a runtime, category, privacy or task value whose option you did not supply, and that filter would change the result count, search names the option instead: `search python` points to `--runtime python`, because runtimes are not searched text. Every count keeps your other words and filters. Hints follow the results under `Hints (results are unchanged):`, and `--json` adds a `hints` array only when there are hints. Only plain words (letters, digits, `.`, `+` and `-`, at most 40 characters) are echoed, and only the first 20 distinct words are considered. Exit codes are unchanged.

Shortlist accepts known task ids from `tasks`. It lists projects that cover at least one requested task, ordered by coverage and then id. Each result states matched and missing tasks. This is a transparent catalog lookup, not a quality ranking, integration compatibility test or deployment recommendation.

Add `--json` to discovery commands for structured output. List, search, show, compare and shortlist include the assessment date. Errors go to stderr and return exit code 1. No matches is a successful empty result with exit code 0. `validate` checks the local catalog, prints the number of owned and fork entries, and takes no options. `node cli.mjs --version` prints the CLI version from `package.json` and needs no catalog; include it in bug reports.

## Interpret the snapshot

The catalog describes assessed public projects, with forks labeled separately. The profile itself is presentation infrastructure and is not a project entry. Each entry points to an immutable reviewed README revision. Classification is editorial and static. A source link is provenance, not proof that every claim in that source is true. Privacy labels describe a documented workflow and are not a security certification. Runtime labels may indicate required combinations or alternative interfaces. Read the source for exact versions.

Owned-project pins identify reviewed source commits. The three historical fork entries retain their earlier assessments and were outside the public non-fork review. Repositories can advance independently; current README links help identify changes before setup. No deployment, availability, package publication or current compatibility check is implied.

For connect.md, the assessed README describes the guest builder. The [middleware at the same revision](https://github.com/EauDoon/connect.md/blob/2c036a3657bbc6de253ce9c0af5015afdc2c580b/apps/web/middleware.ts) explicitly leaves new network routes outside its retired-route block. The catalog therefore distinguishes optional network source from the guest workflow; whether those routes are configured in production remains unverified.

The profile introduction is curated; the catalog includes the assessed public set. The inventory check below also records projects held out of assessment. Existing upstream attribution stays with each fork. Reflection Engine originates from Kevin Rose's [kropdx/reflection-engine](https://github.com/kropdx/reflection-engine); Hermes Agent originates from [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent).

## Check public inventory coverage

```text
node cli.mjs validate
node scripts/inventory-check.mjs
npm run check
```

`npm run check` runs catalog validation, the existing tests, generated-document and link checks, the dated drift check, the public-inventory coverage check, and the version and changelog consistency check. No command fetches repositories or makes network calls.

[public-inventory.json](../public-inventory.json) records a dated, complete public non-fork owner inventory and explicit exclusions. The coverage check reuses the CLI's inventory comparison, rejects non-public/fork records, detects missing or archived catalog entries and stale snapshots, and prints held projects separately. An owned catalog entry that the owner keeps while its repository is private is named in the optional `privateEntries` list, each with a public reason, and is not reported absent. The check flags a private entry that appears in the public snapshot again, so the list cannot outlive the reason. A passed check establishes consistency with that saved snapshot, not today's GitHub inventory or project quality.

The drift and inventory checks compare UTC calendar dates. East of UTC the local date can be a day ahead of the UTC date, so write `assessedOn`, `lastAudited` and `retrievedOn` as UTC dates. `node scripts/drift.mjs --today YYYY-MM-DD` pins the drift reference date, `--check` (the default) or `--json` selects the output, and `--help` prints the usage line. A usage error exits 2; an invalid date or maximum age exits 1.

To refresh it, save every page of GitHub's public repository search for `user:EauDoon is:public fork:false` outside the repository, then build a candidate from the saved pages:

```text
gh api -X GET search/repositories -f q="user:EauDoon is:public fork:false" -f per_page=100 -f page=1 > page-1.json
curl -s "https://api.github.com/search/repositories?q=user%3AEauDoon%20is%3Apublic%20fork%3Afalse&per_page=100&page=1" > page-1.json
node scripts/inventory-build.mjs --output candidate-inventory.json page-1.json
node scripts/inventory-check.mjs candidate-inventory.json
```

Save one file per page (`page=2` and so on while results remain), or one file of every page from `gh api --paginate --slurp`. Bash and PowerShell 7 write these files as UTF-8; in Windows PowerShell 5.1, `>` writes UTF-16, which the builder rejects, so pipe to `Set-Content -Encoding utf8 page-1.json` instead. Each file shares the 1 MiB JSON limit, and at most 100 pages are accepted. `node scripts/inventory-build.mjs` reads only the files you supply and makes no network call. It rejects the whole build, and writes nothing, when any page lacks `incomplete_results: false`, the pages disagree on `total_count`, `total_count` exceeds the 1,000 results the search can return, the distinct repositories differ from `total_count`, or any item is not an explicitly public, non-fork repository owned by EauDoon with an archive flag. A rejected build means the inventory is unknown, never an empty successful inventory.

The candidate keeps the checked-in format: public visibility, fork and archive flags, the retrieval date (`--retrieved-on`, default today's UTC date) and the fixed source. Exclusions and private entries are carried from the base snapshot (`--base`, default `public-inventory.json`). An exclusion the search no longer returns is dropped, and a private entry the search now returns is kept so the check flags it. The printed review lists added and removed repositories, archive changes, dropped exclusions, carried private entries and the coverage check's issues; it exits 0 when the candidate has no issues and 1 when it has issues or was rejected, and a usage error exits 2. The candidate is written only to a new file and never replaces `public-inventory.json`: review it, then copy it over yourself. A private entry never goes in `repositories`, which holds only what the public search returned. Do not query private repositories, infer why a former public entry is absent, automatically advance source pins, or publish an unreviewed project.

## Review a catalog update

Keep a copy of the prior JSON, edit a separate candidate, and compare them without applying changes:

```text
node scripts/diff.mjs previous-catalog.json candidate-catalog.json
node scripts/diff.mjs previous-catalog.json candidate-catalog.json --json
node scripts/diff.mjs previous-catalog.json candidate-catalog.json --values
```

Both inputs must pass the same schema and size checks as the published catalog. The diff lists added and removed ids, changed fields, and assessment metadata changes. Project ordering and object-key ordering do not create false changes. Array ordering remains significant. A new source revision requires a fresh read of its content; the tool does not approve new claims automatically.

Add `--values` (with or without `--json`, in either order) to review each change in place. Every changed field prints its before and after value, and a field missing on one side prints as `(absent)` (in JSON that side's key is omitted). A source change that moves the revision also prints a `review:` link, `https://github.com/EauDoon/<id>/compare/<old>...<new>`, for reading the changes since the pinned revision. When only the README link moves (an id casing fix keeps the revision), the source lines print the two links and no `review:` link. Metadata changes print both values, and each added or removed project prints its summary, boundary and assessed README. In JSON, each changed entry gains `values` (`{field, before, after}` rows) and, for a re-pin, `review`; the top level gains `metadataValues`, `addedProjects` and `removedProjects`. Without `--values` the text and JSON output are unchanged.

See [the maintainer workflow](../CONTRIBUTING.md) for source review, regeneration and acceptance checks.

For reusable briefs, contextual filter counts, paged results, complementary project sets, exports, receipts, revision impact and review handoffs, see [repeatable discovery workflows](WORKFLOWS.md). Those commands preserve the same static-assessment boundary.
