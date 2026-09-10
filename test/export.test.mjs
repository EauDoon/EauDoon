import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCatalog } from '../lib/catalog.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { csvCell, renderSelection, writeNewOutput } from '../lib/export.mjs';

test('selection exports quote formulas and preserve explicit authority limits', () => {
  const c = loadCatalog(); const q = normalizeQuery({ version: 1, text: 'synthetic payment' }, c);
  assert.equal(csvCell(' =HYPERLINK("bad")'), '"\' =HYPERLINK(""bad"")"');
  const csv = renderSelection(c, q, 'csv');
  assert.equal(csv.split('\r\n').filter(Boolean).length, 2);
  assert.match(csv, /no live routing/);
  assert.equal(JSON.parse(renderSelection(c, q, 'json')).total, 1);
  assert.match(renderSelection(c, q, 'markdown'), /No project was executed/);
  assert.throws(() => renderSelection(c, q, 'html'), /format/);
});
test('exclusive export never replaces an existing file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-export-')); const file = join(dir, 'out.csv');
  try { writeNewOutput(file, 'first'); assert.throws(() => writeNewOutput(file, 'second'), /EEXIST/); assert.equal(readFileSync(file, 'utf8'), 'first'); }
  finally { unlinkSync(file); rmdirSync(dir); }
});
