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
  assert.throws(() => inventoryDiff(c, { owner: 'EauDoon', repositories: [{ id: 123, public: true }] }), /public repository ids/);
});
