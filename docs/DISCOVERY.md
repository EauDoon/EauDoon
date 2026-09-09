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

Add `--json` to discovery commands for structured output. List, search, show, compare and shortlist include the assessment date. Errors go to stderr and return exit code 1. No matches is a successful empty result with exit code 0. `validate` checks the local catalog and takes no options.

## Interpret the snapshot

The 16 entries describe public repositories, including three forks and this profile. They point to immutable reviewed README revisions. Classification is editorial and static. A source link is provenance, not proof that every claim in that source is true. Privacy labels describe a documented workflow and are not a security certification. Runtime labels may indicate required combinations or alternative interfaces. Read the source for exact versions.

The source revision for this profile describes the profile before the discovery CLI was added. Other repositories can advance independently. Current README links help identify changes before setup. No deployment, availability or current compatibility check is implied.

The profile introduction is curated; the catalog includes the complete assessed public set. Existing upstream attribution stays with each fork. Reflection Engine originates from Kevin Rose's [kropdx/reflection-engine](https://github.com/kropdx/reflection-engine); Hermes Agent originates from [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent).

## Review a catalog update

Keep a copy of the prior JSON, edit a separate candidate, and compare them without applying changes:

```text
node scripts/diff.mjs previous-catalog.json candidate-catalog.json
node scripts/diff.mjs previous-catalog.json candidate-catalog.json --json
```

Both inputs must pass the same schema and size checks as the published catalog. The diff lists added and removed ids, changed fields, and assessment metadata changes. Project ordering and object-key ordering do not create false changes. Array ordering remains significant. A new source revision requires a fresh read of its content; the tool does not approve new claims automatically.
