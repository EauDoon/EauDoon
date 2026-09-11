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
