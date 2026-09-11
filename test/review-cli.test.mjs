import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadCatalog } from '../lib/catalog.mjs';

const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 5000 });
const parsed = (...args) => { const result = run(...args); assert.equal(result.status, 0, result.stderr); return JSON.parse(result.stdout); };
function workspace(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-review-'));
  try { fn((name, value) => { const path = join(dir, name); if (value !== undefined) writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value)); return path; }); }
  finally { for (const name of readdirSync(dir)) unlinkSync(join(dir, name)); rmdirSync(dir); }
}

test('global catalog selection reproduces discovery and receipts from a supplied snapshot', () => workspace(file => {
  const catalog = loadCatalog(); catalog.projects = catalog.projects.filter(p => p.id === 'operator-labs');
  const snapshot = file('snapshot.json', catalog);
  assert.deepEqual(parsed('--catalog', snapshot, 'list', '--json').projects.map(p => p.id), ['operator-labs']);
  assert.equal(parsed('--catalog', snapshot, 'receipt').projectCount, 1);
  assert.equal(run('--catalog', snapshot, 'show', 'mandatebound').status, 1);
  assert.equal(run('--catalog').status, 1);
  assert.equal(run('--catalog', file('bad.json', {}), 'list').status, 1);
}));
