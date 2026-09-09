import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { coveragePlan } from '../lib/plan.mjs';

test('coverage planning finds a complementary pair that greedy first-choice misses', () => {
  const c = loadCatalog();
  c.projects = c.projects.slice(0, 3).map((p, i) => ({ ...p, id: ['a','b','c'][i], tasks: [['one','two'],['one','three'],['two','four']][i] }));
  const q = normalizeQuery({ version: 1 }, c); const request = { tasks: ['one','two','three','four'] };
  const result = coveragePlan(c, q, request, 2);
  assert.deepEqual(result.projects.map(p => p.id), ['b','c']);
  assert.deepEqual(result.missingTasks, []);
  assert.equal(coveragePlan(c, q, request, 1).missingTasks.length, 2);
  assert.throws(() => coveragePlan(c, q, { tasks: ['unknown'] }, 2), /known/);
  assert.throws(() => coveragePlan(c, q, request, 5), /1 to 4/);
  assert.equal(coveragePlan(c, normalizeQuery({ version: 1, exclude: ['a','b','c'] }, c), request, 2).projects.length, 0);
});
