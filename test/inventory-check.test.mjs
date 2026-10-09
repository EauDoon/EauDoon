import test from 'node:test';
import assert from 'node:assert/strict';
import { checkInventory } from '../scripts/inventory-check.mjs';
import { loadCatalog, readJson } from '../lib/catalog.mjs';

const snapshot = () => readJson(new URL('../public-inventory.json', import.meta.url));
const check = (catalog, inventory) => checkInventory(catalog, inventory, inventory.retrievedOn);

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
