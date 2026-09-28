import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { inventoryDiff } from '../lib/workflows.mjs';

test('public inventory comparison reports only observed differences', () => {
  const c = loadCatalog();
  const snapshot = { owner: 'EauDoon', repositories: c.projects.slice(1).map(p => ({ id: p.id, public: true })) };
  snapshot.repositories.push({ id: 'synthetic-example', public: true });
  const r = inventoryDiff(c, snapshot);
  assert.deepEqual(r.absentFromSnapshot, [c.projects[0].id]);
  assert.deepEqual(r.unassessed, ['synthetic-example']);
  snapshot.repositories[0].public = false;
  assert.throws(() => inventoryDiff(c, snapshot), /public/);
  const ordered = { owner: 'EauDoon', repositories: c.projects.filter(p => p.id !== 'EauDoon' && p.id !== 'agent-action-stack').map(p => ({ id: p.id, public: true })) };
  assert.deepEqual(inventoryDiff(c, ordered).absentFromSnapshot, ['agent-action-stack', 'EauDoon']);
  const extras = { owner: 'EauDoon', repositories: [...c.projects.map(p => ({ id: p.id, public: true })), { id: 'EauDoon-extra', public: true }, { id: 'agent-extra', public: true }] };
  assert.deepEqual(inventoryDiff(c, extras).unassessed, ['agent-extra', 'EauDoon-extra']);
  assert.throws(() => inventoryDiff(c, { owner: 'EauDoon', repositories: [{ id: 123, public: true }] }), /public repository ids/);
});
