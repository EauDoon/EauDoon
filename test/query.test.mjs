import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery, runQuery, facets } from '../lib/query.mjs';
import { taskIndex } from '../lib/discover.mjs';

test('saved query uses alternatives within fields and intersections across fields', () => {
  const c = loadCatalog();
  const q = normalizeQuery({ version: 1, filters: { runtime: ['node', 'python'], privacy: ['local-after-setup'] }, exclude: ['OPERATOR-LABS'] }, c);
  const result = runQuery(c, q);
  assert.ok(result.some(p => p.id === 'mandatebound'));
  assert.ok(result.some(p => p.id === 'constitutional-agent-testbench'));
  assert.ok(result.every(p => p.privacy === 'local-after-setup' && p.id !== 'operator-labs'));
  for (const input of [{ version: 1, filters: { runtime: ['ruby'] } }, { version: 1, secret: true }, { version: 1, filters: { runtime: ['node', 'node'] } }, { version: 1, text: '\u202Ehidden' }]) assert.throws(() => normalizeQuery(input, c));
});

test('facets preserve other constraints and show unavailable replacement choices', () => {
  const c = loadCatalog();
  const q = normalizeQuery({ version: 1, filters: { runtime: ['python'], category: ['publishing'] } }, c);
  const result = facets(c, q);
  assert.equal(result.total, 1);
  assert.equal(result.facets.runtime.find(x => x.value === 'python').selected, true);
  assert.equal(result.facets.runtime.find(x => x.value === 'assistant').count, 0);
  assert.equal(result.facets.runtime.find(x => x.value === 'node').count, 1);
  assert.equal(result.facets.category.find(x => x.value === 'decision-methods').count, runQuery(c, { ...q, filters: { ...q.filters, category: ['decision-methods'] } }).length);
});

test('whitespace-only query text cannot silently match every project', () => {
  const c = loadCatalog();
  for (const text of [' ', '   ', '\u00a0']) assert.throws(() => normalizeQuery({ version: 1, text }, c), /visible word/);
  assert.throws(() => normalizeQuery({ version: 1, text: '\u2028' }, c));
  const trimmed = normalizeQuery({ version: 1, text: '  synthetic payment  ' }, c);
  assert.equal(trimmed.text, 'synthetic payment');
  assert.equal(runQuery(c, normalizeQuery({ version: 1, text: '' }, c)).length, c.projects.length);
  assert.equal(runQuery(c, normalizeQuery({ version: 1 }, c)).length, c.projects.length);
});

test('line and paragraph separators are not query text', () => {
  const c = loadCatalog();
  for (const text of ['hello\u2028world', 'hello\u2029world']) assert.throws(() => normalizeQuery({ version: 1, text }, c));
});

test('task tags are listed in case-insensitive catalog order', () => {
  const projects = [
    { id: 'b', summary: 'Second', category: 'discovery', runtimes: ['node'], privacy: 'public-content', fork: false, tasks: ['Zebra', 'apple'] },
    { id: 'a', summary: 'First', category: 'discovery', runtimes: ['node'], privacy: 'public-content', fork: false, tasks: ['gate-actions', 'Apple'] },
  ];
  assert.deepEqual(taskIndex(projects).map(item => item.task), ['Apple', 'apple', 'gate-actions', 'Zebra']);
  const catalog = { assessedOn: '2026-09-23', projects };
  const listed = facets(catalog, normalizeQuery({ version: 1 }, catalog)).facets.task.map(item => item.value);
  assert.deepEqual(listed, ['Apple', 'apple', 'gate-actions', 'Zebra']);
});

test('explicit null fields cannot silently broaden an authored brief', () => {
  const c = loadCatalog();
  for (const field of ['text','filters','exclude']) assert.throws(() => normalizeQuery({ version: 1, [field]: null }, c));
});
