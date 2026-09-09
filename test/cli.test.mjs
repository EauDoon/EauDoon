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
test('filters intersect and never silently broaden invalid requests', () => {
  const result = run('list', '--runtime', 'python', '--privacy', 'local-after-setup', '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).projects.map(p => p.id), ['agent-action-stack', 'constitutional-agent-testbench', 'operator-labs']);
  for (const args of [['list', '--runtime', 'ruby'], ['list', '--fork'], ['list', '--json', '--json'], ['list', '--runtime', 'node', '--runtime', 'python']]) assert.equal(run(...args).status, 1);
  assert.equal(JSON.parse(run('list', '--fork', 'yes', '--json').stdout).projects.length, 3);
});
test('detail binds setup guidance to a reviewed source without running it', () => {
  const result = run('show', 'MANDATEBOUND', '--json');
  assert.equal(result.status, 0, result.stderr);
  const p = JSON.parse(result.stdout);
  assert.equal(p.id, 'mandatebound');
  assert.match(p.start[0], new RegExp(p.source.revision));
  assert.match(p.boundary, /not determined/);
  assert.equal(run('show', 'unknown').status, 1);
  assert.equal(run('show', 'mandatebound', '--runtime', 'node').status, 1);
});
