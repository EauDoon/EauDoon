# Security Policy

This repository is a static public profile catalog. It contains no production
services, no runtime secrets, and no customer data. There is no application
code executed by third parties from this repo.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting on this repository rather
than opening a public issue. Go to the repository's Security tab and choose
"Report a vulnerability." That channel keeps the report private until a fix is
ready.

If GitHub private reporting is unavailable for any reason, contact the
maintainer directly through the profile listed on the maintainer's personal
site before sharing any details publicly.

## What to expect

- An acknowledgement within a reasonable window.
- A triage note describing whether the report is in scope.
- A coordinated disclosure timeline if a fix is needed.

## Scope

This is a portfolio catalog, not a deployed service. Most reports will be out
of scope. In-scope items include:

- Malicious content in `catalog.json` or other tracked files.
- Dependency or workflow vulnerabilities that affect this repository.
- Anything that would mislead a reader about a listed project.

Reports about the projects referenced in `catalog.json` belong with the
maintainers of those projects, not here.