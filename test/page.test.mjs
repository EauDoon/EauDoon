import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery, runQuery } from '../lib/query.mjs';
import { pageResults } from '../lib/page.mjs';

test('cursor navigation covers results once and refuses stale contexts', () => {
  const c = loadCatalog(); const q = normalizeQuery({ version: 1 }, c);
  let page = pageResults(c, q, 4); const ids = page.projects.map(p => p.id); const firstCursor = page.next;
  while (page.next) { page = pageResults(c, q, 4, page.next); ids.push(...page.projects.map(p => p.id)); }
  assert.deepEqual(ids, runQuery(c, q).map(p => p.id));
  assert.equal(pageResults(c, q, 4, page.previous).offset, page.offset - 4);
  assert.throws(() => pageResults(c, q, 5, firstCursor), /Cursor/);
  const changed = structuredClone(c); changed.projects[0].summary += ' Updated';
  assert.throws(() => pageResults(changed, q, 4, firstCursor), /Cursor/);
  assert.throws(() => pageResults(c, q, 4, '$bad'), /cursor/);
  assert.equal(pageResults(c, normalizeQuery({ version: 1, text: 'no-match-xyz' }, c), 4).next, null);
});
