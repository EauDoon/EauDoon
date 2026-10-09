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

`show` prints prerequisites categories, authority limits, the assessed README and current setup instructions. Follow those repository-specific instructions after reviewing their requirements. The discovery CLI never clones, installs, launches or executes a catalog entry.

List, search and shortlist accept `--category`, `--runtime`, `--privacy`, and `--fork yes|no`. List and search also accept `--task`. Filters intersect. Each option can appear once. An invalid value prints the available choices. Search requires every supplied word to appear in the project's id, summary, category or task tags. No fuzzy matching is performed.

Shortlist accepts known task ids from `tasks`. It lists projects that cover at least one requested task, ordered by coverage and then id. Each result states matched and missing tasks. This is a transparent catalog lookup, not a quality ranking, integration compatibility test or deployment recommendation.

Add `--json` to discovery commands for structured output. List, search, show, compare and shortlist include the assessment date. Errors go to stderr and return exit code 1. No matches is a successful empty result with exit code 0. `validate` checks the local catalog and takes no options. `node cli.mjs --version` prints the CLI version from `package.json` and needs no catalog; include it in bug reports.

## Interpret the snapshot

The catalog describes assessed public projects, with forks labeled separately. The profile itself is presentation infrastructure and is not a project entry. Each entry points to an immutable reviewed README revision. Classification is editorial and static. A source link is provenance, not proof that every claim in that source is true. Privacy labels describe a documented workflow and are not a security certification. Runtime labels may indicate required combinations or alternative interfaces. Read the source for exact versions.

Owned-project pins identify reviewed source commits. The three historical fork entries retain their earlier assessments and were outside the public non-fork review. Repositories can advance independently; current README links help identify changes before setup. No deployment, availability, package publication or current compatibility check is implied.

For connect.md, the assessed README describes the guest builder. The [middleware at the same revision](https://github.com/EauDoon/connect.md/blob/1c030b60d2496b755e506e7b3ae7d56facc4eda5/apps/web/middleware.ts) explicitly leaves new network routes outside its retired-route block. The catalog therefore distinguishes optional network source from the guest workflow; whether those routes are configured in production remains unverified.

The profile introduction is curated; the catalog includes the assessed public set. The inventory check below also records projects held out of assessment. Existing upstream attribution stays with each fork. Reflection Engine originates from Kevin Rose's [kropdx/reflection-engine](https://github.com/kropdx/reflection-engine); Hermes Agent originates from [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent).

## Check public inventory coverage

```text
node cli.mjs validate
node scripts/inventory-check.mjs
npm run check
```

`npm run check` runs catalog validation, the existing tests, generated-document and link checks, the dated drift check, and the public-inventory coverage check. No command fetches repositories or makes network calls.

[public-inventory.json](../public-inventory.json) records a dated, complete public non-fork owner inventory and explicit exclusions. The coverage check reuses the CLI's inventory comparison, rejects non-public/fork records, detects missing or archived catalog entries and stale snapshots, and prints held projects separately. A passed check establishes consistency with that saved snapshot, not today's GitHub inventory or project quality.

The drift and inventory checks compare UTC calendar dates. East of UTC the local date can be a day ahead of the UTC date, so write `assessedOn`, `lastAudited` and `retrievedOn` as UTC dates. `node scripts/drift.mjs --today YYYY-MM-DD` pins the drift reference date, `--check` (the default) or `--json` selects the output, and `--help` prints the usage line. A usage error exits 2; an invalid date or maximum age exits 1.

To refresh it, retrieve every page from GitHub's public repository search for `user:EauDoon is:public fork:false`; require `incomplete_results: false` and reconcile the returned total before replacing the snapshot. Preserve public visibility, fork and archive flags, record the retrieval date and source, and review exclusions. An API error or incomplete result is unknown, never an empty successful inventory. Do not query private repositories, infer why a former public entry is absent, automatically advance source pins, or publish an unreviewed project.

## Review a catalog update

Keep a copy of the prior JSON, edit a separate candidate, and compare them without applying changes:

```text
node scripts/diff.mjs previous-catalog.json candidate-catalog.json
node scripts/diff.mjs previous-catalog.json candidate-catalog.json --json
```

Both inputs must pass the same schema and size checks as the published catalog. The diff lists added and removed ids, changed fields, and assessment metadata changes. Project ordering and object-key ordering do not create false changes. Array ordering remains significant. A new source revision requires a fresh read of its content; the tool does not approve new claims automatically.

See [the maintainer workflow](../CONTRIBUTING.md) for source review, regeneration and acceptance checks.

For reusable briefs, contextual filter counts, paged results, complementary project sets, exports, receipts, revision impact and review handoffs, see [repeatable discovery workflows](WORKFLOWS.md). Those commands preserve the same static-assessment boundary.
