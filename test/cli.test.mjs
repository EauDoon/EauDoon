import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const run = (...args) => spawnSync(process.execPath, [fileURLToPath(new URL('../cli.mjs', import.meta.url)), ...args], { encoding: 'utf8', timeout: 5000 });
test('search is case-insensitive, intersects words and returns parseable provenance', () => {
  const result = run('search', 'SYNTHETIC', 'payment', '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).projects.map(p => p.id), ['operator-labs']);
  assert.match(run('search', 'unmatched-value').stdout, /No projects match/);
});
test('CLI fails on misspelled commands and options', () => {
  for (const args of [['seach'], ['list', '--jsno'], ['search'], ['validate', 'extra']]) assert.equal(run(...args).status, 1);
  assert.match(run('--help').stdout, /No installs/);
});
