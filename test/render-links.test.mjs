import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../lib/catalog.mjs';
import { renderCatalog } from '../lib/render.mjs';
import { checkLinks } from '../lib/links.mjs';

test('generated guide is current, complete and source-bound', () => {
  const c = loadCatalog();
  const text = renderCatalog(c);
  assert.equal(text, readFileSync(new URL('../docs/CATALOG.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n'));
  for (const p of c.projects) { assert.ok(text.includes(`### ${p.id}\n`)); assert.ok(text.includes(p.source.url)); assert.ok(text.includes(p.boundary)); }
  const lines = text.split('\n');
  const tables = lines.map((line, i) => ({ line, i })).filter(x => /^\| ---/.test(x.line));
  assert.equal(tables.length, 2);
  for (const { line, i } of tables) assert.equal(line.split('|').length, lines[i - 1].split('|').length, 'GFM table separator must match header width');
});
test('local link checker rejects traversal, active schemes, credentials and missing targets', () => {
  const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const file = fileURLToPath(new URL('../README.md', import.meta.url));
  assert.deepEqual(checkLinks('[catalog](docs/CATALOG.md)', file, root), []);
  for (const url of ['../outside.md', 'missing.md', 'javascript:alert', 'https://user:secret@github.com', '%2e%2e/outside', '//example.com']) assert.equal(checkLinks(`[bad](${url})`, file, root).length, 1);
});
