import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { queryImpact } from '../lib/impact.mjs';

test('impact distinguishes new, lost and changed retained matches', () => {
  const before = loadCatalog(); const after = structuredClone(before);
  after.projects = after.projects.filter(p => p.id !== 'operator-labs');
  after.projects.find(p => p.id === 'consequence-rail').runtimes.push('python');
  after.projects.find(p => p.id === 'agent-action-stack').boundary += ' Synthetic change';
  const result = queryImpact(before, after, { version: 1, filters: { runtime: ['python'], privacy: ['local-after-setup'] } });
  assert.deepEqual(result.entered, ['consequence-rail']);
  assert.deepEqual(result.left, ['operator-labs']);
  assert.deepEqual(result.changedRetained, [{ id: 'agent-action-stack', fields: ['boundary'] }]);
  const lostTask = queryImpact(before, after, { version: 1, filters: { task: ['check-trace-privacy'] } });
  assert.equal(lostTask.afterCount, 0);
  assert.deepEqual(lostTask.left, ['operator-labs']);
});
