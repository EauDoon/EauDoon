import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery, runQuery, facets } from '../lib/query.mjs';

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
