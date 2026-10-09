import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// npm itself is a .cmd shim on Windows, so CI runs `npm pack --dry-run` as a
// workflow step. These checks pin the package.json fields that keep that pack
// valid and bounded to the CLI, its data and its documentation.
const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

test('every packed path exists and the profile-only paths stay out', () => {
  assert.ok(Array.isArray(pkg.files) && pkg.files.length, 'package.json needs a files list');
  for (const entry of pkg.files) assert.ok(existsSync(new URL(entry, root)), `files entry ${entry} does not exist`);
  for (const excluded of ['assets', 'audits', 'test', '.github']) {
    assert.ok(!pkg.files.some(entry => entry.replace(/\/$/, '').split('/')[0] === excluded), `${excluded}/ must not be packed`);
  }
  for (const needed of ['cli.mjs', 'lib/', 'catalog.json']) assert.ok(pkg.files.includes(needed), `${needed} must be packed`);
});

test('the bin runs the CLI through a portable shebang', () => {
  assert.deepEqual(Object.keys(pkg.bin), ['eaudoon-catalog']);
  const target = pkg.bin['eaudoon-catalog'];
  assert.ok(pkg.files.includes(target), `bin target ${target} is not packed`);
  assert.ok(readFileSync(new URL(target, root), 'utf8').startsWith('#!/usr/bin/env node\n'), `${target} must start with #!/usr/bin/env node`);
});

test('package metadata matches the license, repository and runtime', () => {
  const licenseLine = readFileSync(new URL('LICENSE', root), 'utf8').split('\n')[0];
  assert.equal(pkg.license, licenseLine.split(' ')[0]);
  assert.equal(pkg.engines.node, '>=22');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.repository.url, 'git+https://github.com/EauDoon/EauDoon.git');
  assert.ok(pkg.name && pkg.version && pkg.description, 'npm pack needs a name and version');
  assert.equal(pkg.dependencies, undefined, 'the catalog has no runtime dependencies');
});
