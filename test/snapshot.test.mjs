import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { diffSnapshots } from '../lib/snapshot.mjs';

test('snapshot review detects semantic changes and ignores project/key ordering', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  after.projects.reverse();
  after.projects[0] = Object.fromEntries(Object.entries(after.projects[0]).reverse());
  assert.deepEqual(diffSnapshots(before, after).changed, []);
  after.projects.find(p => p.id === 'EauDoon').summary = 'Public discovery tools';
  after.projects = after.projects.filter(p => p.id !== 'mandatebound');
  after.assessedOn = '2026-09-10';
  const diff = diffSnapshots(before, after);
  assert.deepEqual(diff.removed, ['mandatebound']);
  assert.deepEqual(diff.changed, [{ id: 'EauDoon', fields: ['summary'] }]);
  assert.deepEqual(diff.metadataChanged, ['assessedOn']);
  assert.deepEqual(diffSnapshots(after, before).added, ['mandatebound']);
});
