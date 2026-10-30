import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, flattenPages, parseArgs, serialize, UsageError } from '../scripts/inventory-build.mjs';
import { checkInventory } from '../scripts/inventory-check.mjs';
import { loadCatalog, readJson } from '../lib/catalog.mjs';

const inventoryUrl = new URL('../public-inventory.json', import.meta.url);
const base = () => readJson(inventoryUrl);
const script = fileURLToPath(new URL('../scripts/inventory-build.mjs', import.meta.url));
const checker = fileURLToPath(new URL('../scripts/inventory-check.mjs', import.meta.url));
const run = (args, cwd) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000, cwd });

// One saved search response in the shape GitHub returns, built from rows of
// the checked-in snapshot, so no fixture names a repository that is not public.
const item = row => ({ name: row.id, full_name: `EauDoon/${row.id}`, owner: { login: 'EauDoon' }, private: false, fork: false, archived: row.archived, visibility: 'public' });
const page = (rows, total = rows.length, extra = {}) => ({ total_count: total, incomplete_results: false, items: rows.map(item), ...extra });
const today = () => new Date().toISOString().slice(0, 10);

function workspace(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'inventory-build-'));
  try { return fn(dir, (name, value) => { const path = join(dir, name); writeFileSync(path, JSON.stringify(value)); return path; }); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

test('saved search pages rebuild the checked-in snapshot byte for byte', () => {
  const snapshot = base();
  const built = buildInventory([page(snapshot.repositories)], snapshot, snapshot.retrievedOn);
  assert.equal(serialize(built.candidate), readFileSync(inventoryUrl, 'utf8').replace(/\r\n/g, '\n'));
  assert.equal(built.totalCount, snapshot.repositories.length);
  assert.deepEqual([built.added, built.removed, built.archivedChanged, built.droppedExclusions], [[], [], [], []]);
  assert.deepEqual(built.carriedPrivateEntries, (snapshot.privateEntries ?? []).map(row => row.id));
  assert.deepEqual(checkInventory(loadCatalog(), built.candidate, snapshot.retrievedOn).issues, []);
});

test('pages may be split across files, slurped into one array, or both', () => {
  const snapshot = base();
  const rows = [...snapshot.repositories].reverse();
  const [first, second] = [page(rows.slice(0, 5), rows.length), page(rows.slice(5), rows.length)];
  const expected = buildInventory([page(snapshot.repositories)], snapshot, '2026-11-01').candidate;
  for (const files of [[first, second], [[first, second]], [[first], second], [second, [first]]]) {
    assert.deepEqual(buildInventory(flattenPages(files), snapshot, '2026-11-01').candidate, expected);
  }
  // The same repository on two pages, as pagination can repeat, is counted once.
  const repeated = [page(rows.slice(0, 6), rows.length), page(rows.slice(5), rows.length)];
  assert.deepEqual(buildInventory(repeated, snapshot, '2026-11-01').candidate, expected);
  assert.equal(expected.retrievedOn, '2026-11-01');
});

test('an incomplete, failed or ambiguous search is rejected as unknown', () => {
  const snapshot = base();
  const rows = snapshot.repositories;
  const build = pages => () => buildInventory(pages, snapshot, snapshot.retrievedOn);
  const changed = (index, change) => { const value = page(rows); change(value.items[index]); return [value]; };
  for (const [pages, pattern] of [
    [[page(rows, rows.length, { incomplete_results: true })], /incomplete_results: false/],
    [[(({ incomplete_results, ...rest }) => rest)(page(rows))], /incomplete_results: false/],
    [[page(rows.slice(0, 5), rows.length), page(rows.slice(5), rows.length + 1)], /disagree on total_count/],
    [[page(rows, 1001)], /exceeds 1000/],
    [[page(rows.slice(1), rows.length)], /distinct repositories but total_count is/],
    [[page(rows, rows.length - 1)], /distinct repositories but total_count is/],
    [[page([], 0)], /returned no repositories/],
    [[page(rows, 'many')], /integer total_count/],
    [[{ message: 'API rate limit exceeded' }], /search response with items/],
    [[null], /search response with items/],
    [changed(0, x => { x.private = true; }), /explicitly public/],
    [changed(0, x => { delete x.private; }), /explicitly public/],
    [changed(0, x => { x.visibility = 'private'; }), /explicitly public/],
    [changed(0, x => { x.fork = true; }), /not a fork/],
    [changed(0, x => { delete x.archived; }), /archived/],
    [changed(0, x => { x.owner.login = 'someone-else'; }), /owned by EauDoon/],
    [changed(0, x => { x.full_name = 'someone-else/project'; }), /owned by EauDoon/],
    [changed(0, x => { x.name = 'under_score'; x.full_name = 'EauDoon/under_score'; }), /supported id format/],
    [[page([...rows, { ...rows[0], archived: !rows[0].archived }], rows.length)], /twice with different details/],
    [[page([...rows, { ...rows[0], id: rows[0].id.toUpperCase() }], rows.length)], /twice with different details/],
    [[], /1 to 100 search pages/],
  ]) assert.throws(build(pages), pattern, String(pattern));
  assert.throws(() => buildInventory([page(rows)], snapshot, '2026-02-30'), /valid YYYY-MM-DD/);
  assert.throws(() => flattenPages(Array(101).fill(page(rows))), /At most 100 search pages/);
  assert.throws(() => flattenPages([[]]), /No search pages/);
  assert.equal(flattenPages([Array(100).fill(page(rows))]).length, 100);
});

test('the review reports added, removed and archived repositories and dropped exclusions', () => {
  const snapshot = base();
  const [kept, ...rest] = snapshot.exclusions.length ? snapshot.exclusions : [{ id: snapshot.repositories[0].id }];
  const excludedId = kept.id;
  const rows = snapshot.repositories.filter(row => row.id.toLowerCase() !== excludedId.toLowerCase());
  const flipped = { ...rows[0], archived: !rows[0].archived };
  const pages = [page([flipped, ...rows.slice(1), { id: 'synthetic-new-project', archived: false }])];
  const built = buildInventory(pages, snapshot, snapshot.retrievedOn);
  assert.deepEqual(built.added, ['synthetic-new-project']);
  assert.deepEqual(built.removed, [snapshot.repositories.find(row => row.id === excludedId).id]);
  assert.deepEqual(built.archivedChanged, [flipped.id]);
  assert.deepEqual(built.droppedExclusions, [excludedId]);
  assert.deepEqual(built.candidate.exclusions, rest);
  assert.ok(built.candidate.repositories.some(row => row.id === 'synthetic-new-project'));
  assert.match(checkInventory(loadCatalog(), built.candidate, snapshot.retrievedOn).issues.join('\n'), /synthetic-new-project: needs assessment/);
});

test('a private entry that the public search now returns is carried and flagged', () => {
  const snapshot = base();
  const catalog = loadCatalog();
  const privateEntries = snapshot.privateEntries?.length ? snapshot.privateEntries
    : [{ id: catalog.projects.find(p => !p.fork).id, reason: 'Catalogued while the repository is private.' }];
  const withPrivate = { ...snapshot, privateEntries, repositories: snapshot.repositories.filter(row => row.id.toLowerCase() !== privateEntries[0].id.toLowerCase()) };
  const built = buildInventory([page([...withPrivate.repositories, { id: privateEntries[0].id, archived: false }])], withPrivate, snapshot.retrievedOn);
  assert.deepEqual(built.candidate.privateEntries, privateEntries);
  assert.deepEqual(built.carriedPrivateEntries, privateEntries.map(row => row.id));
  assert.match(checkInventory(catalog, built.candidate, snapshot.retrievedOn).issues.join('\n'), /listed as private but present in the public snapshot/);
  // A base written before privateEntries existed yields a candidate without it.
  const older = structuredClone(snapshot);
  delete older.privateEntries;
  const plain = buildInventory([page(older.repositories)], older, older.retrievedOn);
  assert.equal(Object.hasOwn(plain.candidate, 'privateEntries'), false);
  assert.deepEqual(plain.carriedPrivateEntries, []);
});

test('builder arguments: one value per flag, at least one page and an output', () => {
  assert.deepEqual(parseArgs(['--output', 'new.json', 'a.json', 'b.json']), { pages: ['a.json', 'b.json'], output: 'new.json' });
  assert.deepEqual(parseArgs(['a.json', '--base', 'old.json', '--retrieved-on', '2026-10-31', '--output', 'new.json']),
    { pages: ['a.json'], base: 'old.json', retrievedOn: '2026-10-31', output: 'new.json' });
  for (const args of [[], ['a.json'], ['--output', 'new.json'], ['--output'], ['--output', '--base', 'x', 'a.json'],
    ['--output', 'a.json', '--output', 'b.json', 'c.json'], ['--other', 'x', '--output', 'new.json', 'a.json'], ['-o', 'new.json', 'a.json']]) {
    assert.throws(() => parseArgs(args), error => error instanceof UsageError && /^Usage: node scripts\/inventory-build\.mjs /.test(error.message), args.join(' '));
  }
});

test('the builder CLI writes a reviewed candidate that the coverage check accepts', () => workspace((dir, file) => {
  const snapshot = base();
  const pages = file('page-1.json', page(snapshot.repositories));
  const candidate = join(dir, 'candidate.json');
  const result = run(['--output', candidate, pages]);
  assert.equal(result.status, 0, result.stderr);
  const review = JSON.parse(result.stdout);
  assert.equal(review.status, 'written');
  assert.deepEqual(review.issues, []);
  assert.equal(review.retrievedOn, today());
  assert.equal(review.bytes, Buffer.byteLength(readFileSync(candidate, 'utf8')));
  assert.equal(readJson(candidate).retrievedOn, today());
  const checked = spawnSync(process.execPath, [checker, candidate], { encoding: 'utf8', timeout: 10000 });
  assert.equal(checked.status, 0, checked.stderr);
  // A slurped file and an explicit date and base give the same candidate.
  const slurped = file('slurped.json', [page(snapshot.repositories.slice(0, 4), snapshot.repositories.length), page(snapshot.repositories.slice(4), snapshot.repositories.length)]);
  const dated = join(dir, 'dated.json');
  const again = run(['--base', fileURLToPath(inventoryUrl), '--retrieved-on', snapshot.retrievedOn, '--output', dated, slurped]);
  assert.equal(again.status, JSON.parse(again.stdout).issues.length ? 1 : 0, again.stderr);
  assert.equal(readFileSync(dated, 'utf8'), readFileSync(inventoryUrl, 'utf8').replace(/\r\n/g, '\n'));
  // A retrieval date older than 45 days is written, and the review reports it.
  const old = join(dir, 'old.json');
  const stale = run(['--retrieved-on', '2020-01-01', '--output', old, pages]);
  assert.equal(stale.status, 1, stale.stderr);
  assert.match(JSON.parse(stale.stdout).issues.join('\n'), /older than 45 days; refresh required/);
  assert.equal(readJson(old).retrievedOn, '2020-01-01');
}));

test('the builder CLI never replaces a file and writes nothing for rejected pages', () => workspace((dir, file) => {
  const snapshot = base();
  const pages = file('page.json', page(snapshot.repositories));
  const existing = join(dir, 'existing.json');
  writeFileSync(existing, 'keep');
  const kept = run(['--output', existing, pages]);
  assert.equal(kept.status, 1);
  assert.match(kept.stderr, /^inventory-build: Output already exists; choose a new destination\r?\n$/);
  assert.equal(readFileSync(existing, 'utf8'), 'keep');
  const incomplete = file('incomplete.json', page(snapshot.repositories, snapshot.repositories.length, { incomplete_results: true }));
  const target = join(dir, 'never.json');
  const rejected = run(['--output', target, incomplete]);
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /incomplete_results: false; the inventory is unknown/);
  assert.equal(rejected.stdout, '');
  assert.equal(existsSync(target), false);
  const badDate = run(['--retrieved-on', '2026-02-30', '--output', target, pages]);
  assert.equal(badDate.status, 1);
  assert.equal(existsSync(target), false);
  const extra = file('extra.json', page([...snapshot.repositories, { id: 'synthetic-new-project', archived: false }]));
  const flagged = join(dir, 'flagged.json');
  const withIssue = run(['--output', flagged, extra]);
  assert.equal(withIssue.status, 1, withIssue.stderr);
  assert.match(JSON.parse(withIssue.stdout).issues.join('\n'), /synthetic-new-project: needs assessment/);
  assert.ok(existsSync(flagged));
}));

test('builder usage errors exit 2 without echoing arguments, and importing runs nothing', () => {
  for (const args of [[], ['PRIVATE_MARKER.json'], ['--PRIVATE_MARKER', 'x', '--output', 'y', 'z'], ['--output', 'a', '--output', 'b', 'c'], ['--base']]) {
    const result = run(args);
    assert.equal(result.status, 2, args.join(' '));
    assert.doesNotMatch(result.stderr, /PRIVATE_MARKER/);
    assert.match(result.stderr, /^inventory-build: Usage: /);
    assert.equal(result.stdout, '');
  }
  const importOnly = spawnSync(process.execPath, ['--input-type=module', '--eval', 'await import("./scripts/inventory-build.mjs")'], {
    encoding: 'utf8', cwd: fileURLToPath(new URL('..', import.meta.url)), timeout: 10000,
  });
  assert.equal(importOnly.status, 0, importOnly.stderr);
  assert.equal(importOnly.stdout + importOnly.stderr, '');
});
