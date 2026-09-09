import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog, validate } from '../lib/catalog.mjs';

test('public snapshot contains 16 distinct pinned projects', () => {
  const c = loadCatalog();
  assert.equal(c.projects.length, 16);
  assert.equal(c.projects.filter(p => p.fork).length, 3);
  assert.deepEqual(validate(c), []);
});
test('rejects malformed, unknown, duplicate and injected catalog values', () => {
  for (const mutate of [
    c => c.projects.push(c.projects[0]), c => c.projects[0].repository = 'https://example.com',
    c => c.projects[0].source.revision = 'main', c => c.projects[0].summary = '\u001b[31m',
    c => c.projects[0].runtimes = ['unknown'], c => c.projects[0].secret = 'unexpected',
    c => c.assessedOn = '2026-02-31', c => c.projects[0].source = null,
  ]) { const c = loadCatalog(); mutate(c); assert.ok(validate(c).length); }
  assert.ok(validate(null).length);
});
