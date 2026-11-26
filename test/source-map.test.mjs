import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const run = (...args) => spawnSync(process.execPath, ['--experimental-vm-modules', 'scripts/source-map.mjs', ...args], {
  cwd: fileURLToPath(root), encoding: 'utf8',
});
test('graph query agrees with the shipped offline page in both directions', () => {
  const full = run('--json');
  assert.equal(full.status, 0, full.stderr);
  const data = JSON.parse(full.stdout);
  const html = readFileSync(new URL('docs/source-map.html', root), 'utf8');
  const embedded = html.match(/<script id="model" type="application\/json">([\s\S]+?)<\/script>/);
  assert.deepEqual(JSON.parse(embedded[1]), data);
  const repo = data.data.repository;
  const modules = new Map(repo.modules.map(m => [m.id, m]));
  const single = run('--json', 'lib/query.mjs');
  assert.equal(single.status, 0, single.stderr);
  assert.deepEqual(JSON.parse(single.stdout).data.repository.module, modules.get('lib/query.mjs'));
  for (const m of modules.values()) {
    assert.equal(m.entryPath[0], repo.entry);
    assert.equal(m.entryPath.at(-1), m.id);
    for (const [i, id] of m.entryPath.slice(1).entries()) assert.ok(modules.get(m.entryPath[i]).imports.includes(id));
    for (const id of m.imports) assert.ok(modules.get(id).importedBy.includes(m.id));
    assert.ok(html.includes('>' + m.id + '</a></th>'));
  }
  assert.ok(modules.get('lib/catalog.mjs').external.includes('node:fs'));
  assert.equal(run('--check').status, 0);
  assert.equal(run('--json', 'missing.mjs').status, 1);
  assert.equal(run('--check', 'cli.mjs').status, 1);
});

test('module change review follows import direction, including empty and identity paths', () => {
  const query = (...args) => {
    const result = run(...args);
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout).data.repository;
  };
  const impact = query('--impact', 'lib/query.mjs');
  const consumer = impact.consumers.find(row => row.id === 'cli.mjs');
  assert.equal(consumer.distance, 2);
  assert.equal(consumer.importPath[0], 'cli.mjs');
  assert.equal(consumer.importPath.at(-1), 'lib/query.mjs');
  assert.deepEqual(query('--impact', 'cli.mjs').consumers, []);
  assert.equal(query('--path', 'lib/query.mjs', 'cli.mjs').path, null);
  assert.deepEqual(query('--path', 'cli.mjs', 'cli.mjs').path, ['cli.mjs']);
  assert.equal(query('--path', 'cli.mjs', 'lib/query.mjs').path.length, 3);
  const fs = query('--external').external.find(row => row.specifier === 'node:fs');
  assert.ok(fs.importedBy.includes('lib/catalog.mjs'));
  assert.equal(run('--path', 'cli.mjs', 'missing.mjs').status, 1);
});
