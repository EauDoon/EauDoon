import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { diagnoseQuery } from '../lib/diagnose.mjs';

test('diagnosis explains no results without changing or relaxing exclusions', () => {
  const c = loadCatalog();
  const q = normalizeQuery({ version: 1, filters: { runtime: ['python'], category: ['publishing'] }, exclude: ['llms-txt-personal-site'] }, c);
  const original = JSON.stringify(q); const result = diagnoseQuery(c, q);
  assert.deepEqual(result.matchingIds, []);
  assert.equal(result.excludedCount, 1);
  assert.equal(JSON.stringify(q), original);
  assert.ok(result.nearMisses.every(p => p.id !== 'llms-txt-personal-site'));
  assert.ok(result.singleConstraintRelaxations.every(p => !p.additionalProjects.includes('llms-txt-personal-site')));
  assert.equal(result.singleConstraintRelaxations.find(p => p.omittedConstraint === 'runtime').matchCount, 1);
  assert.deepEqual(result.nearMisses.find(p => p.id === 'connect.md').failedConstraints, ['runtime']);
});
