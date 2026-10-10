import { readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { readJson, validDate, errorMessage } from '../lib/catalog.mjs';
import { SEMVER } from '../lib/version.mjs';

const repository = 'https://github.com/EauDoon/EauDoon';
const usage = 'Usage: node scripts/version-check.mjs [--tag vX.Y.Z | --notes vX.Y.Z]';

// SemVer 2.0.0 precedence (section 11): numeric core, then a release above any
// of its prereleases, then prerelease identifiers left to right. Build
// metadata is ignored.
export function compareVersions(a, b) {
  const [x, y] = [SEMVER.exec(a), SEMVER.exec(b)];
  if (!x || !y) throw new Error('Expected SemVer 2.0.0 versions');
  for (let i = 1; i <= 3; i += 1) {
    const diff = BigInt(x[i]) - BigInt(y[i]);
    if (diff) return diff > 0n ? 1 : -1;
  }
  if (x[4] === undefined || y[4] === undefined) return (x[4] === undefined) - (y[4] === undefined);
  const [p, q] = [x[4].split('.'), y[4].split('.')];
  for (let i = 0; i < Math.max(p.length, q.length); i += 1) {
    if (p[i] === undefined) return -1;
    if (q[i] === undefined) return 1;
    const [pn, qn] = [/^\d+$/.test(p[i]), /^\d+$/.test(q[i])];
    if (pn && qn) {
      const diff = BigInt(p[i]) - BigInt(q[i]);
      if (diff) return diff > 0n ? 1 : -1;
    } else if (pn !== qn) {
      return pn ? -1 : 1;
    } else if (p[i] !== q[i]) {
      return p[i] < q[i] ? -1 : 1;
    }
  }
  return 0;
}

// Bracketed level-2 headings are the release history. Unbracketed headings,
// such as the dated pre-versioning sections and Notes, are not checked.
function bracketedHeadings(changelog) {
  return changelog.replace(/\r\n/g, '\n').split('\n')
    .map((text, index) => ({ text, line: index + 1 }))
    .filter(({ text }) => text.startsWith('## ['));
}

// Checks that package.json, CHANGELOG.md and, when given, a release tag
// agree. Messages quote line numbers and package data, never the tag text.
export function checkVersion({ pkg, changelog, tag }) {
  const errors = [];
  const version = pkg?.version;
  const versionOk = typeof version === 'string' && SEMVER.test(version);
  if (!versionOk) errors.push('package.json version is not a SemVer 2.0.0 version');
  const headings = bracketedHeadings(changelog);
  const unreleased = headings.filter(({ text }) => text === '## [Unreleased]');
  if (unreleased.length !== 1) errors.push(`CHANGELOG.md needs exactly one "## [Unreleased]" heading; found ${unreleased.length}`);
  else if (headings[0] !== unreleased[0]) errors.push('CHANGELOG.md "## [Unreleased]" must come before every release heading');
  const releases = [];
  for (const { text, line } of headings) {
    if (text === '## [Unreleased]') continue;
    const match = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/.exec(text);
    if (!match || !SEMVER.test(match[1]) || !validDate(match[2])) {
      errors.push(`CHANGELOG.md line ${line}: a release heading must read "## [X.Y.Z] - YYYY-MM-DD"`);
      continue;
    }
    const [, release, date] = match;
    const previous = releases.at(-1);
    if (previous && compareVersions(previous.version, release) <= 0) errors.push(`CHANGELOG.md line ${line}: ${release} must be lower than ${previous.version} above it`);
    if (previous && date > previous.date) errors.push(`CHANGELOG.md line ${line}: ${release} is dated after ${previous.version} above it`);
    releases.push({ version: release, date, line });
  }
  const references = new Set(changelog.replace(/\r\n/g, '\n').split('\n').filter(text => /^\[[^\]]+\]: \S+$/.test(text)));
  const newest = releases[0];
  if (![...references].some(text => text.startsWith('[Unreleased]: '))) errors.push('CHANGELOG.md needs an "[Unreleased]: URL" link reference');
  else if (newest && !references.has(`[Unreleased]: ${repository}/compare/v${newest.version}...HEAD`)) {
    errors.push(`CHANGELOG.md [Unreleased] link must compare v${newest.version}...HEAD`);
  }
  for (const { version: release } of releases) {
    if (!references.has(`[${release}]: ${repository}/releases/tag/v${release}`)) errors.push(`CHANGELOG.md needs the link reference "[${release}]: ${repository}/releases/tag/v${release}"`);
  }
  if (versionOk) {
    const prerelease = SEMVER.exec(version)[4] !== undefined;
    if (!prerelease && newest?.version !== version) errors.push(`package.json version ${version} must equal the newest CHANGELOG.md release heading (${newest?.version ?? 'none'})`);
    if (prerelease && newest && compareVersions(version, newest.version) <= 0) errors.push(`package.json prerelease ${version} must sort above the newest release ${newest.version}`);
    if (tag !== undefined) {
      if (tag !== `v${version}`) errors.push(`The tag does not match package.json version ${version}; tag v${version} instead`);
      if (prerelease) errors.push(`package.json version ${version} is a prerelease and cannot be tagged for release`);
      if (!releases.some(release => release.version === version)) errors.push(`CHANGELOG.md has no "## [${version}]" release heading`);
    }
  }
  return { version, releases: releases.map(release => release.version), errors };
}

// The body of one release section: everything between its heading and the
// next level-2 heading or the closing link references, without blank edges.
export function releaseNotes(changelog, version) {
  const lines = changelog.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex(text => text.startsWith(`## [${version}] - `));
  if (start === -1) throw new Error('CHANGELOG.md has no release heading for that version');
  let end = lines.findIndex((text, index) => index > start && (text.startsWith('## ') || /^\[[^\]]+\]: \S+$/.test(text)));
  if (end === -1) end = lines.length;
  const body = lines.slice(start + 1, end);
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body.at(-1).trim()) body.pop();
  return `${body.join('\n')}\n`;
}

class UsageError extends Error {}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && !(args.length === 2 && ['--tag', '--notes'].includes(args[0]))) throw new UsageError(usage);
  const tag = args[1];
  if (tag !== undefined && !(tag.startsWith('v') && SEMVER.test(tag.slice(1)))) throw new UsageError(`${args[0]} must be v followed by a SemVer 2.0.0 version`);
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  if (args[0] === '--notes') {
    process.stdout.write(releaseNotes(changelog, tag.slice(1)));
    return;
  }
  const pkg = readJson(new URL('../package.json', import.meta.url));
  const result = checkVersion({ pkg, changelog, tag });
  if (result.errors.length) {
    for (const error of result.errors) console.error(`version-check: ${error}`);
    process.exitCode = 1;
    return;
  }
  const newest = result.releases[0] ?? 'none';
  console.log(`version-check: package ${result.version}, newest release ${newest}${tag === undefined ? '' : `, tag v${result.version}`}: consistent.`);
}

function invokedAsCli() {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

// Importing checkVersion must not read files or print anything.
if (invokedAsCli()) {
  try { main(); } catch (error) {
    console.error(`version-check: ${errorMessage(error)}`);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  }
}
