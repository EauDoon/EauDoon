import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkInventory } from '../scripts/inventory-check.mjs';
import { loadCatalog, readJson } from '../lib/catalog.mjs';

const snapshot = () => readJson(new URL('../public-inventory.json', import.meta.url));
const check = (catalog, inventory) => checkInventory(catalog, inventory, inventory.retrievedOn);

// The CLI compares retrievedOn with today's UTC date, so it only ever runs on a
// copy dated today. Running it on the real public-inventory.json would make
// npm test fail 46 days after that snapshot was retrieved.
test('the inventory CLI exits 0 on a clean snapshot and 1 on an issue or bad usage', () => {
  const script = fileURLToPath(new URL('../scripts/inventory-check.mjs', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
  const dir = mkdtempSync(join(tmpdir(), 'inventory-check-'));
  try {
    const clean = { ...snapshot(), retrievedOn: new Date().toISOString().slice(0, 10) };
    const cleanPath = join(dir, 'clean.json');
    writeFileSync(cleanPath, JSON.stringify(clean));
    const passed = run(cleanPath);
    assert.equal(passed.status, 0, passed.stderr);
    assert.deepEqual(JSON.parse(passed.stdout).issues, []);
    const extra = structuredClone(clean);
    extra.repositories.push({ id: 'new-public-project', public: true, fork: false, archived: false });
    const extraPath = join(dir, 'extra.json');
    writeFileSync(extraPath, JSON.stringify(extra));
    const flagged = run(extraPath);
    assert.equal(flagged.status, 1, flagged.stderr);
    assert.match(JSON.parse(flagged.stdout).issues.join('\n'), /new-public-project: needs assessment/);
    const usage = run(cleanPath, extraPath);
    assert.equal(usage.status, 1);
    assert.match(usage.stderr, /^inventory: unknown: Usage: node scripts\/inventory-check\.mjs/);
    assert.equal(usage.stdout, '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('public non-fork inventory is covered by assessed projects and explicit exclusions', () => {
  const result = check(loadCatalog(), snapshot());
  assert.deepEqual(result.issues, []);
  assert.equal(result.matched + result.exclusions.length, snapshot().repositories.length);
});

test('missing, archived, duplicate and self entries cannot silently pass', () => {
  const inventory = snapshot(), catalog = loadCatalog();
  inventory.repositories.push({ id: 'new-public-project', public: true, fork: false, archived: false });
  assert.match(check(catalog, inventory).issues.join('\n'), /new-public-project: needs assessment/);
  inventory.repositories[0].archived = true;
  assert.match(check(catalog, inventory).issues.join('\n'), /archived in the snapshot/);
  inventory.repositories.push(inventory.repositories[0]);
  assert.throws(() => check(catalog, inventory), /unique public/);
  const self = { ...catalog, projects: [...catalog.projects, { ...catalog.projects[0], id: 'EauDoon' }] };
  assert.match(check(self, snapshot()).issues.join('\n'), /presentation infrastructure/);
  const absent = snapshot();
  absent.repositories = absent.repositories.filter(row => row.id !== catalog.projects[0].id);
  assert.match(check(catalog, absent).issues.join('\n'), /absent from the supplied/);
});

test('an owned project catalogued while private is named in privateEntries, not reported absent', () => {
  const catalog = loadCatalog();
  const owned = catalog.projects.find(p => !p.fork);
  const value = snapshot();
  value.repositories = value.repositories.filter(row => row.id.toLowerCase() !== owned.id.toLowerCase());
  const existing = value.privateEntries ?? [];
  delete value.privateEntries;
  assert.match(check(catalog, value).issues.join('\n'), new RegExp(`${owned.id}: absent from the supplied`));
  value.privateEntries = [...existing, { id: owned.id, reason: 'Catalogued while the repository is private.' }];
  const result = check(catalog, value);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.privateEntries, value.privateEntries);
});

test('a private entry that is public again must leave privateEntries', () => {
  const catalog = loadCatalog();
  const owned = catalog.projects.find(p => !p.fork);
  const value = snapshot();
  if (!value.repositories.some(row => row.id.toLowerCase() === owned.id.toLowerCase())) {
    value.repositories.push({ id: owned.id, public: true, fork: false, archived: false });
  }
  value.privateEntries = [...(value.privateEntries ?? []), { id: owned.id, reason: 'Catalogued while the repository is private.' }];
  const issues = check(catalog, value).issues;
  assert.deepEqual(issues, [`${owned.id}: listed as private but present in the public snapshot; remove it from privateEntries`]);
});

test('private entries must name unique owned catalog projects with a public reason', () => {
  const catalog = loadCatalog();
  const owned = catalog.projects.find(p => !p.fork).id;
  const fork = catalog.projects.find(p => p.fork).id;
  const reason = 'Catalogued while the repository is private.';
  for (const entries of [{}, 'blitz', [{ id: 'not-in-catalog', reason }], [{ id: fork, reason }],
    [{ id: owned, reason }, { id: owned.toUpperCase(), reason }], [{ id: owned, reason: ' ' }],
    [{ id: owned, reason: `held${String.fromCharCode(0x2028)}back` }], [{ id: owned, reason: 'a <b>' }],
    [{ id: owned, reason, extra: true }], [{ id: owned }]]) {
    const value = snapshot();
    value.repositories = value.repositories.filter(row => row.id.toLowerCase() !== owned.toLowerCase());
    value.privateEntries = entries;
    assert.throws(() => check(catalog, value), /Private entries must name/, JSON.stringify(entries));
  }
  const misspelt = snapshot();
  misspelt.privateEntry = [];
  assert.throws(() => check(catalog, misspelt), /complete dated public owner inventory/);
});

test('incomplete, private, fork, stale and invalid snapshots cannot become passes', () => {
  const catalog = loadCatalog();
  for (const change of [s => { s.complete = false; }, s => { s.repositories[0].public = false; },
    s => { s.repositories[0].fork = true; }, s => { s.repositories = []; },
    s => { s.exclusions.push(s.exclusions[0]); }, s => { s.exclusions[0].reason = ''; }]) {
    const value = snapshot(); change(value);
    assert.throws(() => check(catalog, value));
  }
  // Catalog text has rejected line and paragraph separators since the
  // separator fix; an exclusion reason is public text of the same kind.
  for (const separator of [0x2028, 0x2029]) {
    const value = snapshot();
    value.exclusions[0].reason = `held${String.fromCharCode(separator)}back`;
    assert.throws(() => check(catalog, value), /Exclusions must name/, separator.toString(16));
  }
  const value = snapshot();
  const shiftedDate = days => new Date(Date.parse(value.retrievedOn) + days * 86400000).toISOString().slice(0, 10);
  assert.match(checkInventory(catalog, value, shiftedDate(46)).issues.join('\n'), /refresh required/);
  assert.match(checkInventory(catalog, value, shiftedDate(-1)).issues.join('\n'), /future-dated/);
  assert.throws(() => checkInventory(catalog, value, 'invalid'), /dated/);
});
