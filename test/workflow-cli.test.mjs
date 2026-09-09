import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadCatalog } from '../lib/catalog.mjs';

const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 5000 });
const parsed = (...args) => { const result = run(...args); assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout); };
function workspace(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'discovery-flow-'));
  try { fn((name, value) => { const file = join(dir, name); if (value !== undefined) writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); return file; }); }
  finally { for (const name of readdirSync(dir)) unlinkSync(join(dir, name)); rmdirSync(dir); }
}

test('real CLI completes discovery, review and handoff without losing existing outputs', () => workspace(file => {
  const c = loadCatalog();
  const query = file('query.json', { version: 1, text: 'synthetic payment' });
  const all = file('all.json', { version: 1 });
  const inventory = file('inventory.json', { owner: 'EauDoon', repositories: c.projects.map(p => ({ id: p.id, public: true })) });
  assert.equal(parsed('inventory', inventory).matched, c.projects.length);
  assert.equal(parsed('query', query).projects[0].id, 'operator-labs');
  assert.equal(parsed('facets', query).total, 1);
  const page = parsed('page', all, '3');
  assert.equal(parsed('page', all, '3', page.next).offset, 3);
  const tasks = file('tasks.json', { tasks: ['gate-actions','replay-evidence'] });
  assert.deepEqual(parsed('plan', all, tasks, '1').missingTasks, []);
  const csv = file('selection.csv');
  parsed('export', query, 'csv', csv); const initialCsv = readFileSync(csv);
  assert.equal(run('export', all, 'csv', csv).status, 1);
  assert.deepEqual(readFileSync(csv), initialCsv);
  const receipt = parsed('receipt');
  const receiptFile = file('receipt.json', receipt);
  assert.equal(parsed('verify-receipt', receiptFile, receipt.digest).matches, true);
  assert.equal(run('verify-receipt', receiptFile, '0'.repeat(64)).status, 1);
  const catalog = file('catalog.json', c);
  assert.deepEqual(parsed('impact', catalog, catalog, query).entered, []);
  const packet = file('packet.json'); const created = parsed('handoff', query, packet);
  assert.equal(parsed('verify-handoff', packet, created.digest).projectCount, 1);
  const impossible = file('none.json', { version: 1, text: 'unmatched-synthetic-query' });
  const before = readFileSync(impossible);
  assert.deepEqual(parsed('diagnose', impossible).matchingIds, []);
  assert.deepEqual(readFileSync(impossible), before);
}));

test('malformed and duplicate JSON fail without echoing input content', () => workspace(file => {
  const malformed = file('malformed.json', 'SENSITIVE_DEMO');
  const result = run('query', malformed);
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stderr, /SENSITIVE_DEMO/);
  const duplicate = file('duplicate.json', '{"version":1,"filters":null,"filters":{}}');
  const repeated = run('query', duplicate);
  assert.equal(repeated.status, 1);
  assert.match(repeated.stderr, /Duplicate JSON/);
}));
