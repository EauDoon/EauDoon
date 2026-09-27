import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../lib/catalog.mjs';
import { renderCatalog } from '../lib/render.mjs';
import { checkLinks, markdownFiles } from '../lib/links.mjs';

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
test('the link check walks every Markdown file, not a fixed list of four', () => {
  const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
  const found = markdownFiles(root).map(file => relative(root, file).split(sep).join('/'));
  for (const name of ['README.md', 'docs/CATALOG.md', 'docs/DISCOVERY.md', 'docs/WORKFLOWS.md',
    'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md', '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug_report.md', '.github/ISSUE_TEMPLATE/feature_request.md',
    'audits/2026-09-23-utf16-fix.md']) assert.ok(found.includes(name), `${name} is not link-checked`);
  assert.equal(found.length, new Set(found).size);
  const run = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/links.mjs', import.meta.url))], { encoding: 'utf8', timeout: 10000 });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, new RegExp(`pass in ${found.length} Markdown files`));
});
