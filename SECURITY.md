# Security Policy

This repository contains a public profile, a curated catalog, and an offline
Node.js CLI. It does not provide a hosted service. The CLI reads local catalog,
query, and review files, and writes exports only when explicitly requested.
It does not execute listed projects, make network requests, or send telemetry.
Keep credentials and private data out of shared input files and exports.

## Supported versions

Security fixes go to the latest release and to `main`. Earlier releases are
not patched; upgrade to the latest release instead. Run
`node cli.mjs --version` to see which version you have.

## Reporting a vulnerability

Do not open a public issue with vulnerability details.

1. Report privately through GitHub's advisory form:
   <https://github.com/EauDoon/EauDoon/security/advisories/new>. The report
   stays visible only to you and the maintainer until a fix is published.
2. If that form is unavailable (GitHub shows it only while private
   vulnerability reporting is enabled for this repository), open a public
   issue titled `Security contact request`. Include no details of the
   vulnerability. The maintainer will reply on that issue to arrange a
   private channel, and the details are shared only there.

Please include the output of `node cli.mjs --version` or the commit you
tested, the affected command or file, and the smallest input that reproduces
the problem.

## What to expect

- An acknowledgement within a reasonable window.
- A triage note describing whether the report is in scope.
- A coordinated disclosure timeline if a fix is needed.

## Scope

This is a portfolio catalog, not a deployed service. Most reports will be out
of scope. In-scope items include:

- Malicious content in `catalog.json` or other tracked files.
- Parser, path-handling, resource-limit, and output-overwrite bugs in the CLI.
- Dependency or workflow vulnerabilities that affect this repository.
- Anything that would mislead a reader about a listed project.

Reports about the projects referenced in `catalog.json` belong with the
maintainers of those projects, not here.
