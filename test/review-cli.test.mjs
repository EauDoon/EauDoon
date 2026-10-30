import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadCatalog } from '../lib/catalog.mjs';
import { readJson } from '../lib/catalog.mjs';

const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 5000 });
const parsed = (...args) => { const result = run(...args); assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout); };
function workspace(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-review-'));
  try { fn((name, value) => { const path = join(dir, name); if (value !== undefined) writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value)); return path; }); }
  finally { for (const name of readdirSync(dir)) unlinkSync(join(dir, name)); rmdirSync(dir); }
}

test('global catalog selection reproduces discovery and receipts from a supplied snapshot', () => workspace(file => {
  const catalog = loadCatalog(); catalog.projects = catalog.projects.filter(p => p.id === 'operator-labs');
  const snapshot = file('snapshot.json', catalog);
  assert.deepEqual(parsed('--catalog', snapshot, 'list', '--json').projects.map(p => p.id), ['operator-labs']);
  assert.equal(parsed('--catalog', snapshot, 'receipt').projectCount, 1);
  assert.equal(run('--catalog', snapshot, 'show', 'mandatebound').status, 1);
  assert.equal(run('--catalog').status, 1);
  assert.equal(run('--catalog', file('bad.json', {}), 'list').status, 1);
}));

test('workflow help is command-specific and needs no readable catalog or output', () => workspace(file => {
  for (const args of [['export', '--help'], ['help', 'export'], ['--catalog', file('missing.json'), 'export', '--help']]) {
    const result = run(...args); assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /export QUERY.json FORMAT NEW-OUTPUT/);
  }
  assert.equal(run('help', 'unknown').status, 1);
  assert.equal(run('export', '--help', 'extra').status, 1);
}));

test('CLI diagnostics do not reveal paths or terminal control arguments', () => workspace(file => {
  for (const args of [['query', file('PRIVATE_MARKER.json')], ['show', '\u001b[31mPRIVATE_MARKER'], ['list', '--PRIVATE_MARKER']]) {
    const result = run(...args); assert.equal(result.status, 1);
    assert.doesNotMatch(result.stderr, /PRIVATE_MARKER|\u001b|catalog-review-/);
    assert.match(result.stderr, /^catalog: /);
  }
  const query = file('query.json', { version: 1 }); const output = file('PRIVATE_MARKER.csv', 'keep');
  assert.doesNotMatch(run('export', query, 'csv', output).stderr, /PRIVATE_MARKER/);
  assert.equal(readFileSync(output, 'utf8'), 'keep');
}));

test('JSON inputs reject excessive nesting before recursive receipt processing', () => workspace(file => {
  const nested = depth => '['.repeat(depth) + '0' + ']'.repeat(depth);
  assert.ok(Array.isArray(readJson(file('allowed.json', nested(64)))));
  assert.throws(() => readJson(file('deep.json', nested(65))), /nesting exceeds 64/);
  const result = run('verify-receipt', file('receipt.json', nested(10000)));
  assert.equal(result.status, 1); assert.match(result.stderr, /nesting exceeds 64/);
  assert.doesNotMatch(result.stderr, /call stack|RangeError/);
  assert.equal(readJson(file('string.json', JSON.stringify('['.repeat(1000)))), '['.repeat(1000));
}));

test('NDJSON export retains provenance for both matching and empty selections', () => workspace(file => {
  for (const text of ['', 'unmatched-query-value']) {
    const query = file('query.json', { version: 1, text }); const target = file(text ? 'empty.ndjson' : 'all.ndjson');
    parsed('export', query, 'ndjson', target);
    const records = readFileSync(target, 'utf8').trim().split('\n').map(line => JSON.parse(line));
    assert.equal(records[0].kind, 'selection'); assert.equal(records[0].total, records.length - 1);
    assert.equal(records[0].query.text, text); assert.equal(records[0].assessedOn, loadCatalog().assessedOn);
    assert.ok(records.slice(1).every(row => row.kind === 'project' && row.project.source.revision.length === 40 && row.project.boundary));
    const again = file(text ? 'empty-again.ndjson' : 'all-again.ndjson'); parsed('export', query, 'ndjson', again);
    assert.deepEqual(readFileSync(target), readFileSync(again));
    assert.equal(run('export', query, 'ndjson', target).status, 1);
  }
}));

test('save-query carries an interactive search into reusable workflows without overwrites', () => workspace(file => {
  const target = file('brief.json');
  const result = parsed('save-query', target, 'synthetic', 'payment', '--runtime', 'python');
  assert.equal(result.status, 'written');
  const saved = JSON.parse(readFileSync(target, 'utf8'));
  assert.deepEqual(saved, { version: 1, text: 'synthetic payment', filters: { runtime: ['python'] }, exclude: [] });
  assert.deepEqual(parsed('query', target).projects, parsed('search', 'synthetic', 'payment', '--runtime', 'python', '--json').projects);
  assert.equal(run('save-query', target).status, 1);
  assert.deepEqual(JSON.parse(readFileSync(target, 'utf8')), saved);
  const invalid = file('invalid.json'); assert.equal(run('save-query', invalid, '--runtime', 'unsupported').status, 1);
  assert.throws(() => readFileSync(invalid));
  assert.equal(run('save-query', invalid, '--json').status, 1);
}));

test('batch evaluates named briefs atomically and exposes empty results', () => workspace(file => {
  const request = { version: 1, queries: [{ id: 'payments', query: { version: 1, text: 'synthetic payment' } }, { id: 'empty', query: { version: 1, text: 'no-matching-value' } }] };
  const input = file('batch.json', request); const result = parsed('batch', input);
  assert.equal(result.emptyCount, 1); assert.equal(result.catalogDigest.length, 64);
  assert.deepEqual(result.results.map(row => row.ids), [['operator-labs'], []]);
  assert.deepEqual(result, parsed('batch', input));
  for (const invalid of [{ ...request, extra: true }, { ...request, queries: [] }, { ...request, queries: Array(21).fill(request.queries[0]) }, { ...request, queries: [...request.queries, request.queries[0]] }, { ...request, queries: [request.queries[0], { id: 'bad', query: { version: 2 } }] }]) {
    const failure = run('batch', file('bad.json', invalid)); assert.equal(failure.status, 1); assert.equal(failure.stdout, '');
  }
}));

test('coverage matrix exposes task owners and uncovered requirements without inventing integration', () => workspace(file => {
  const query = file('query.json', { version: 1, text: 'mandatebound' });
  const tasks = file('tasks.json', { tasks: ['replay-evidence', 'gate-actions'] });
  const result = parsed('coverage', query, tasks);
  assert.deepEqual(result.rows.map(row => row.coveredBy), [['mandatebound'], []]);
  assert.deepEqual(result.missingTasks, ['gate-actions']); assert.ok(result.projects[0].boundary);
  const excluded = file('none.json', { version: 1, text: 'mandatebound', exclude: ['mandatebound'] });
  assert.deepEqual(parsed('coverage', excluded, tasks).missingTasks, ['replay-evidence', 'gate-actions']);
  assert.equal(run('coverage', query, file('bad.json', { tasks: ['unknown-task'] })).status, 1);
}));

test('brief comparison separates requirement changes from resulting membership changes', () => workspace(file => {
  const before = file('before.json', { version: 1, text: 'synthetic payment' });
  const after = file('after.json', { version: 1, text: 'mandatebound' });
  const result = parsed('compare-queries', before, after);
  assert.deepEqual(result.entered, ['mandatebound']); assert.deepEqual(result.left, ['operator-labs']); assert.deepEqual(result.shared, []);
  assert.deepEqual(result.changedConstraints, ['text']); assert.notEqual(result.before.queryDigest, result.after.queryDigest);
  const same = parsed('compare-queries', before, before);
  assert.deepEqual(same.entered, []); assert.deepEqual(same.left, []); assert.deepEqual(same.shared, ['operator-labs']);
  assert.equal(same.before.queryDigest, same.after.queryDigest);
  assert.equal(run('compare-queries', before, file('bad.json', { version: 1, filters: { unsupported: [] } })).status, 1);
}));

test('freshness uses explicit calendar dates with inclusive thresholds and future detection', () => workspace(file => {
  const catalog = loadCatalog(); catalog.assessedOn = '2024-02-28'; const snapshot = file('snapshot.json', catalog);
  const check = (date, maximum) => parsed('--catalog', snapshot, 'freshness', date, maximum);
  assert.equal(check('2024-02-29', '1').status, 'within-threshold');
  assert.equal(check('2024-03-01', '1').status, 'stale'); assert.equal(check('2024-03-01', '1').ageDays, 2);
  assert.equal(check('2024-02-27', '1').status, 'future-assessment');
  assert.deepEqual(check('2024-03-01', '1'), check('2024-03-01', '1'));
  for (const [date, max] of [['2024-02-30', '1'], ['today', '1'], ['2024-03-01', '-1'], ['2024-03-01', '1.5'], ['2024-03-01', '36501']]) assert.equal(run('--catalog', snapshot, 'freshness', date, max).status, 1);
}));

test('freshness reports each entry audit age against the same date and threshold', () => workspace(file => {
  const catalog = loadCatalog(); catalog.assessedOn = '2024-02-28';
  const ids = catalog.projects.map(p => p.id).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  const set = (id, date) => { const p = catalog.projects.find(x => x.id === id); if (date === undefined) delete p.lastAudited; else p.lastAudited = date; };
  for (const id of ids) set(id, '2024-02-28');
  const [inside, edge, stale, future, missing] = ids;
  set(inside, '2024-02-27'); set(edge, '2024-01-31'); set(stale, '2024-01-30'); set(future, '2024-03-02'); set(missing, undefined);
  const snapshot = file('snapshot.json', catalog);
  const result = parsed('--catalog', snapshot, 'freshness', '2024-03-01', '30');
  // The catalog-wide fields are what 1.0.0 printed.
  assert.deepEqual({ ...result, projects: undefined, note: undefined }, { assessedOn: '2024-02-28', asOf: '2024-03-01', maximumDays: 30, ageDays: 2, status: 'within-threshold', catalogDigest: result.catalogDigest, projects: undefined, note: undefined });
  assert.equal(result.catalogDigest, parsed('--catalog', snapshot, 'receipt').digest);
  assert.match(result.note, /^Age of the declared catalog assessment only\. .*Entry ages describe when each catalog entry was last reviewed, not project maintenance\.$/);
  assert.deepEqual(result.projects.map(p => p.id), ids, 'catalog id order');
  const entry = id => result.projects.find(p => p.id === id);
  assert.deepEqual(entry(inside), { id: inside, lastAudited: '2024-02-27', ageDays: 3, status: 'within-threshold' });
  assert.deepEqual(entry(edge), { id: edge, lastAudited: '2024-01-31', ageDays: 30, status: 'within-threshold' }, 'the threshold is inclusive');
  assert.deepEqual(entry(stale), { id: stale, lastAudited: '2024-01-30', ageDays: 31, status: 'stale' });
  assert.deepEqual(entry(future), { id: future, lastAudited: '2024-03-02', ageDays: -1, status: 'future-assessment' });
  assert.deepEqual(entry(missing), { id: missing, lastAudited: null, ageDays: null, status: 'unrecorded' });
  assert.ok(result.projects.every(p => p.ageDays === null || Number.isInteger(p.ageDays)));
}));

test('large piped receipts and batch reports remain complete JSON', () => workspace(file => {
  const catalog = loadCatalog(); const prototype = catalog.projects.find(p => p.id === 'operator-labs');
  catalog.projects = Array.from({ length: 1000 }, (_, i) => {
    const id = `synthetic-project-${String(i).padStart(4, '0')}`; const repository = `https://github.com/EauDoon/${id}`;
    return { ...prototype, id, repository, source: { revision: prototype.source.revision, url: `${repository}/blob/${prototype.source.revision}/README.md` } };
  });
  const snapshot = file('large.json', catalog);
  assert.equal(parsed('--catalog', snapshot, 'receipt').sources.length, 1000);
  const briefs = file('briefs.json', { version: 1, queries: Array.from({ length: 20 }, (_, i) => ({ id: `brief-${i}`, query: { version: 1 } })) });
  const result = parsed('--catalog', snapshot, 'batch', briefs);
  assert.equal(result.results.length, 20); assert.ok(result.results.every(row => row.ids.length === 1000));
}));
