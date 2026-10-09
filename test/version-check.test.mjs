import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkVersion, compareVersions, releaseNotes } from '../scripts/version-check.mjs';

const repo = 'https://github.com/EauDoon/EauDoon';
const script = fileURLToPath(new URL('../scripts/version-check.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });

const unreleasedOnly = [
  '# Changelog', '', '## [Unreleased]', '', '### Added', '- Something.', '',
  '## 2026-09-29 (pre-versioning)', '', '### Fixed', '- Old history.', '',
  '## Notes', '', '- Kept.', '', `[Unreleased]: ${repo}/commits/main`, '',
].join('\n');

const released = [
  '# Changelog', '', '## [Unreleased]', '',
  '## [1.1.0] - 2026-11-02', '', '### Added', '- A new flag.', '',
  '## [1.0.0] - 2026-10-09', '', 'First versioned release.', '', '### Fixed', '- A fix.', '',
  '## 2026-09-29 (pre-versioning)', '', '- Old history.', '',
  `[Unreleased]: ${repo}/compare/v1.1.0...HEAD`,
  `[1.1.0]: ${repo}/releases/tag/v1.1.0`,
  `[1.0.0]: ${repo}/releases/tag/v1.0.0`, '',
].join('\n');

const errors = (version, changelog, tag) => checkVersion({ pkg: { version }, changelog, tag }).errors;

test('a prerelease with no releases yet passes', () => {
  assert.deepEqual(errors('0.0.0-development', unreleasedOnly), []);
  assert.deepEqual(errors('0.0.0-development', unreleasedOnly.replace(/\n/g, '\r\n')), []);
});

test('a released version must equal the newest release heading', () => {
  assert.deepEqual(errors('1.1.0', released), []);
  assert.deepEqual(errors('1.1.0', released, 'v1.1.0'), []);
  assert.deepEqual(errors('1.2.0-rc.1', released), []);
  assert.match(errors('1.0.0', released).join('\n'), /must equal the newest CHANGELOG\.md release heading \(1\.1\.0\)/);
  assert.match(errors('1.0.0', unreleasedOnly).join('\n'), /newest CHANGELOG\.md release heading \(none\)/);
  assert.match(errors('1.1.0-rc.1', released).join('\n'), /must sort above the newest release 1\.1\.0/);
  assert.match(errors('1.0', released).join('\n'), /not a SemVer 2\.0\.0 version/);
});

test('changelog structure errors are each reported', () => {
  for (const [changelog, pattern] of [
    [released.replace('## [Unreleased]\n', '## [Unreleased]\n\n## [Unreleased]\n'), /exactly one "## \[Unreleased\]" heading; found 2/],
    [released.replace('## [Unreleased]\n', ''), /exactly one "## \[Unreleased\]" heading; found 0/],
    [released.replace('## [Unreleased]\n\n', '').replace('## 2026-09-29', '## [Unreleased]\n\n## 2026-09-29'), /must come before every release heading/],
    [released.replace('## [1.0.0] - 2026-10-09', '## [2026-10-09] - First release'), /line 10: a release heading must read/],
    [released.replace('## [1.0.0] - 2026-10-09', '## [1.0.0]'), /line 10: a release heading must read/],
    [released.replace('## [1.0.0] - 2026-10-09', '## [1.0.0] - 2026-02-31'), /line 10: a release heading must read/],
    [released.replace(`[1.0.0]: ${repo}/releases/tag/v1.0.0\n`, ''), /needs the link reference "\[1\.0\.0\]: /],
    [released.replace(`[Unreleased]: ${repo}/compare/v1.1.0...HEAD\n`, ''), /needs an "\[Unreleased\]: URL" link reference/],
    [released.replace('compare/v1.1.0...HEAD', 'compare/v1.0.0...HEAD'), /\[Unreleased\] link must compare v1\.1\.0\.\.\.HEAD/],
    [released.replace('## [1.0.0] - 2026-10-09', '## [1.2.0] - 2026-10-09').replace('[1.0.0]: ', '[1.2.0]: ').replace('tag/v1.0.0', 'tag/v1.2.0'), /1\.2\.0 must be lower than 1\.1\.0 above it/],
    [released.replace('## [1.0.0] - 2026-10-09', '## [1.0.0] - 2026-12-01'), /1\.0\.0 is dated after 1\.1\.0 above it/],
  ]) assert.match(errors('1.1.0', changelog).join('\n'), pattern, String(pattern));
});

test('a tag must name the released package version', () => {
  assert.match(errors('1.1.0', released, 'v1.0.0').join('\n'), /tag does not match package\.json version 1\.1\.0/);
  assert.match(errors('1.1.0', released, '1.1.0').join('\n'), /tag does not match/);
  const prerelease = errors('1.2.0-rc.1', released, 'v1.2.0-rc.1').join('\n');
  assert.match(prerelease, /is a prerelease and cannot be tagged/);
  assert.match(prerelease, /has no "## \[1\.2\.0-rc\.1\]" release heading/);
  assert.doesNotMatch(errors('1.1.0', released, 'v6.6.6-PRIVATE').join('\n'), /PRIVATE/);
});

test('release notes are exactly the section body', () => {
  assert.equal(releaseNotes(released, '1.0.0'), 'First versioned release.\n\n### Fixed\n- A fix.\n');
  assert.equal(releaseNotes(released, '1.1.0'), '### Added\n- A new flag.\n');
  const last = released.replace(/\n## 2026-09-29[\s\S]*?\n\n\[Unreleased\]/, '\n[Unreleased]');
  assert.equal(releaseNotes(last, '1.0.0'), 'First versioned release.\n\n### Fixed\n- A fix.\n');
  assert.throws(() => releaseNotes(released, '9.9.9'), /no release heading/);
});

test('versions sort by SemVer 2.0.0 precedence', () => {
  const ordered = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0', '1.0.1', '1.1.0', '2.0.0', '10.0.0'];
  for (let i = 1; i < ordered.length; i += 1) {
    assert.equal(compareVersions(ordered[i - 1], ordered[i]), -1, `${ordered[i - 1]} < ${ordered[i]}`);
    assert.equal(compareVersions(ordered[i], ordered[i - 1]), 1, `${ordered[i]} > ${ordered[i - 1]}`);
  }
  assert.equal(compareVersions('1.0.0+build.1', '1.0.0+build.2'), 0);
  assert.throws(() => compareVersions('1.0', '1.0.0'), /SemVer/);
});

test('the real package.json and CHANGELOG.md agree', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  assert.deepEqual(checkVersion({ pkg, changelog }).errors, []);
  const cli = run();
  assert.equal(cli.status, 0, cli.stderr);
  assert.match(cli.stdout, new RegExp(`^version-check: package ${pkg.version.replace(/[.+]/g, '\\$&')}, newest release `));
});

test('the version-check CLI rejects bad usage without echoing it', () => {
  assert.equal(run('--tag', 'v9.9.9').status, 1);
  for (const args of [['--tag'], ['--tag', 'PRIVATE'], ['--notes', '9.9.9'], ['--bogus', 'x'], ['PRIVATE']]) {
    const result = run(...args);
    assert.equal(result.status, 2, args.join(' '));
    assert.doesNotMatch(result.stderr, /PRIVATE|bogus/, args.join(' '));
    assert.equal(result.stdout, '');
  }
  const importOnly = spawnSync(process.execPath, ['--input-type=module', '--eval', 'await import("./scripts/version-check.mjs")'], {
    encoding: 'utf8', cwd: fileURLToPath(new URL('..', import.meta.url)), timeout: 10000,
  });
  assert.equal(importOnly.status, 0, importOnly.stderr);
  assert.equal(importOnly.stdout + importOnly.stderr, '');
});
