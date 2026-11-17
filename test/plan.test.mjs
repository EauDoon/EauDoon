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

test('plan alternatives keep the exact tie count, display cap, project limits and task order', () => {
  const c = loadCatalog();
  const base = c.projects[0];
  // Six equally good alternatives to a. One covers a different requested task.
  c.projects = [...'gfedcba'].map(id => ({ ...base, id, tasks: [id === 'b' ? 'two' : 'one'] }));
  const q = normalizeQuery({ version: 1 }, c);
  const request = { tasks: ['two', 'one'] };
  const one = coveragePlan(c, q, request, 1, { alternatives: true });
  assert.deepEqual(one.projects.map(p => p.id), ['a']);
  assert.equal(one.alternativeCount, 6);
  assert.deepEqual(one.alternatives.map(p => p.projectIds), [['b'], ['c'], ['d'], ['e'], ['f']]);
  assert.deepEqual(one.alternatives[0], { projectIds: ['b'], coveredTasks: ['two'], missingTasks: ['one'] });
  assert.deepEqual(one.alternatives[1].missingTasks, ['two']);

  // Full coverage outranks the single-project ties, but larger groups never qualify.
  const two = coveragePlan(c, q, request, 4, { alternatives: true });
  assert.deepEqual(two.projects.map(p => p.id), ['a','b']);
  assert.equal(two.alternativeCount, 5);
  assert.deepEqual(two.alternatives.at(-1), { projectIds: ['b','g'], coveredTasks: ['two','one'], missingTasks: [] });
  const noB = coveragePlan(c, normalizeQuery({ version: 1, exclude: ['b'] }, c), request, 4, { alternatives: true });
  assert.equal(noB.alternativeCount, 5);
  assert.ok(noB.alternatives.every(p => p.projectIds.length === 1));
  const empty = coveragePlan(c, normalizeQuery({ version: 1, exclude: [...'abcdefg'] }, c), request, 4, { alternatives: true });
  assert.deepEqual([empty.alternativeCount, empty.alternatives], [0, []]);
  const plain = coveragePlan(c, q, request, 1);
  const { alternativeCount, alternatives, ...unchanged } = one;
  assert.deepEqual(plain, unchanged);
});
