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
  after.assessedOn = new Date(Date.parse(before.assessedOn) + 86400000).toISOString().slice(0, 10);
  const diff = diffSnapshots(before, after);
  assert.deepEqual(diff.removed, ['mandatebound']);
  assert.deepEqual(diff.changed, [{ id: 'EauDoon', fields: ['summary'] }]);
  assert.deepEqual(diff.metadataChanged, ['assessedOn']);
  assert.deepEqual(diffSnapshots(after, before).added, ['mandatebound']);
});

test('snapshot review reports catalog wave and schema metadata changes', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  after.portfolioWavesCompleted = [...before.portfolioWavesCompleted, 16];
  assert.deepEqual(diffSnapshots(before, after).metadataChanged, ['portfolioWavesCompleted']);
  const dropped = structuredClone(before);
  delete dropped.portfolioWavesCompleted;
  assert.deepEqual(diffSnapshots(before, dropped).metadataChanged, ['portfolioWavesCompleted']);
  const reordered = structuredClone(before);
  reordered.portfolioWavesCompleted = [...before.portfolioWavesCompleted].reverse();
  assert.deepEqual(diffSnapshots(before, reordered).metadataChanged, ['portfolioWavesCompleted']);
  const schema = structuredClone(before);
  schema.schemaVersion = 2;
  assert.deepEqual(diffSnapshots(before, schema).metadataChanged, ['schemaVersion']);
  assert.deepEqual(diffSnapshots(before, structuredClone(before)).metadataChanged, []);
});

test('snapshot review reports fields dropped from a retained project', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  delete after.projects.find(p => p.id === 'consequence-rail').lastAudited;
  delete after.projects.find(p => p.id === 'agent-team-os').source;
  assert.deepEqual(diffSnapshots(before, after).changed, [
    { id: 'agent-team-os', fields: ['source'] },
    { id: 'consequence-rail', fields: ['lastAudited'] },
  ]);
});

test('snapshot id lists follow catalog id order', () => {
  const after = loadCatalog();
  const before = structuredClone(after);
  before.projects = before.projects.filter(p => p.id !== 'EauDoon' && p.id !== 'agent-action-stack');
  assert.deepEqual(diffSnapshots(before, after).added, ['agent-action-stack', 'EauDoon']);
  assert.deepEqual(diffSnapshots(after, before).removed, ['agent-action-stack', 'EauDoon']);
  const edited = structuredClone(after);
  for (const id of ['EauDoon', 'agent-action-stack']) edited.projects.find(p => p.id === id).summary += ' Updated';
  assert.deepEqual(diffSnapshots(after, edited).changed.map(row => row.id), ['agent-action-stack', 'EauDoon']);
});
