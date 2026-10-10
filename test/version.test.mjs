import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SEMVER, packageVersion } from '../lib/version.mjs';

const run = (...args) => spawnSync(process.execPath, [fileURLToPath(new URL('../cli.mjs', import.meta.url)), ...args], { encoding: 'utf8', timeout: 5000 });
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('--version prints exactly the package.json version', () => {
  const result = run('--version');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, `${pkg.version}\n`);
  assert.equal(result.stderr, '');
});

test('--version needs no readable catalog and takes no arguments', () => {
  const missing = run('--catalog', join(tmpdir(), 'no-such-catalog-for-version.json'), '--version');
  assert.equal(missing.status, 0, missing.stderr);
  assert.equal(missing.stdout, `${pkg.version}\n`);
  const extra = run('--version', 'extra');
  assert.equal(extra.status, 1);
  assert.equal(extra.stdout, '');
  assert.doesNotMatch(extra.stderr, /extra/);
  // Single-dash flags stay rejected, as everywhere else in the CLI.
  assert.equal(run('-v').status, 1);
});

test('help names the same version', () => {
  const result = run('--help');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.split('\n')[0], `Offline public project discovery ${pkg.version} (Node.js 22+)`);
});

test('packageVersion reads package.json and rejects an invalid version', () => {
  assert.equal(packageVersion(), pkg.version);
  const dir = mkdtempSync(join(tmpdir(), 'package-version-'));
  try {
    const write = (name, value) => { const path = join(dir, name); writeFileSync(path, JSON.stringify(value)); return path; };
    assert.equal(packageVersion(write('ok.json', { version: '1.2.3' })), '1.2.3');
    for (const [name, value] of [['missing.json', {}], ['number.json', { version: 1 }], ['prefix.json', { version: 'v1.0.0' }], ['null.json', null]]) {
      assert.throws(() => packageVersion(write(name, value)), /Invalid package version/, name);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('SEMVER follows SemVer 2.0.0', () => {
  for (const version of ['0.0.0-development', '1.0.0', '10.20.30', '1.0.0-alpha.1', '1.0.0-0.3.7', '1.0.0+build.5', '1.0.0-rc.1+sha.abc']) {
    assert.match(version, SEMVER, version);
  }
  for (const version of ['1.0', 'v1.0.0', '01.0.0', '1.01.0', '1.0.0-', '1.0.0-01', '1.0.0+', '1.0.0.0', ' 1.0.0', '']) {
    assert.doesNotMatch(version, SEMVER, version);
  }
});
