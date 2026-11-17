import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageResilience } from '../lib/resilience.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { loadCatalog } from '../lib/catalog.mjs';

function fixture() {
  const catalog = loadCatalog();
  const base = catalog.projects[0];
  catalog.projects = [
    { ...base, id: 'alpha', tasks: ['shared', 'only-alpha'] },
    { ...base, id: 'beta', tasks: ['shared'] },
    { ...base, id: 'gamma', tasks: ['outside'] },
  ];
  return catalog;
}

test('resilience distinguishes pre-existing gaps, unique sources and overlapping coverage', () => {
  const catalog = fixture();
  const query = normalizeQuery({ version: 1, exclude: ['gamma'] }, catalog);
  const request = { tasks: ['shared', 'only-alpha', 'outside'] };
  const result = coverageResilience(catalog, query, request);
  assert.deepEqual(result.missingTasks, ['outside']);
  assert.deepEqual(result.singleSourceTasks, [{ task: 'only-alpha', coveredBy: ['alpha'] }]);
  assert.deepEqual(result.redundantTasks, [{ task: 'shared', coveredBy: ['alpha', 'beta'] }]);
  assert.deepEqual(result.criticalProjects, ['alpha']);
  assert.deepEqual(result.removals, [
    { id: 'alpha', newlyMissingTasks: ['only-alpha'], missingTasks: ['only-alpha', 'outside'] },
    { id: 'beta', newlyMissingTasks: [], missingTasks: ['outside'] },
  ]);
  assert.deepEqual(result, coverageResilience(catalog, query, request));
  assert.equal(catalog.projects.length, 3);
  assert.match(result.note, /do not establish interchangeability/);
});

test('an empty selection keeps all gaps and produces no invented redundancy', () => {
  const catalog = fixture();
  const result = coverageResilience(catalog, normalizeQuery({ version: 1, text: 'not-a-match' }, catalog), { tasks: ['shared'] });
  assert.deepEqual(result.missingTasks, ['shared']);
  for (const key of ['removals', 'criticalProjects', 'singleSourceTasks', 'redundantTasks']) assert.deepEqual(result[key], []);
});

test('resilience keeps coverage input bounds and rejects unknown tasks', () => {
  const catalog = fixture(); const query = normalizeQuery({ version: 1 }, catalog);
  assert.throws(() => coverageResilience(catalog, query, { tasks: ['unknown'] }), /known task/);
  assert.throws(() => coverageResilience(catalog, query, { tasks: ['shared', 'shared'] }), /distinct/);
  catalog.projects = Array.from({ length: 101 }, (_, n) => ({ ...catalog.projects[0], id: 'project-' + n }));
  assert.throws(() => coverageResilience(catalog, query, { tasks: ['shared'] }), /at most 100/);
});
