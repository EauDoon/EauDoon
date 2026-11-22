import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog, readJson } from '../lib/catalog.mjs';
import { createHandoff, verifyHandoff } from '../lib/handoff.mjs';
import { normalizeQuery } from '../lib/query.mjs';

const catalog = {
  schemaVersion: 1, assessedOn: '2026-10-01', assessment: 'Fixture assessment.',
  projects: ['Cedar', 'Ash', 'Fir'].map(id => {
    const repository = `https://github.com/EauDoon/${id}`;
    const revision = '1'.repeat(40);
    return {
      id, repository, summary: 'Example project.', category: 'discovery',
      runtimes: ['markdown'], privacy: 'public-content', tasks: ['review'], boundary: 'Reading only.',
      fork: id === 'Fir', source: { revision, url: `${repository}/blob/${revision}/README.md` },
    };
  }),
};
const inventory = {
  retrievedOn: '2026-10-02',
  repositories: [{ id: 'Ash', public: true }],
  privateEntries: [{ id: 'Cedar', reason: 'Fixture repository held in the catalog.' }],
};
const query = (input = {}) => normalizeQuery({ version: 1, ...input }, catalog);
const packetFor = (input, snapshot = inventory) => createHandoff(catalog, query(input), snapshot);

test('a public-only selection keeps its original v1 digest', () => {
  const packet = packetFor({ text: 'Ash' });
  assert.equal(packet.digest, '8610abb317f13f17783fab1f79a0b718e6d8020df5387fe53dc7e47907014960');
  assert.equal(verifyHandoff(catalog, packet, packet.digest, inventory).verified, true);
});

test('a private pin is labeled even when its workflow privacy is public-content', () => {
  const { payload } = packetFor({ text: 'Cedar' });
  assert.deepEqual(payload.sourceAccess, {
    retrievedOn: inventory.retrievedOn, projects: [{ id: 'Cedar', status: 'private' }],
  });
  assert.deepEqual(payload.projects, [catalog.projects[0]]);
  assert.doesNotMatch(payload.authority, /selects public source material/);
  assert.match(payload.authority, /grants no authority/);
  assert.match(payload.reviewSteps[0], /publicly readable/);
});

test('a mixed handoff labels each source in selection order', () => {
  const { payload } = packetFor({});
  assert.deepEqual(payload.sourceAccess.projects, [
    { id: 'Ash', status: 'public' }, { id: 'Cedar', status: 'private' }, { id: 'Fir', status: 'unlisted' },
  ]);
  assert.deepEqual(payload.projects.map(project => project.id), ['Ash', 'Cedar', 'Fir']);
});

test('excluded and filtered-out projects contribute no access metadata', () => {
  const { payload } = packetFor({ exclude: ['CEDAR'], filters: { fork: ['no'] } });
  assert.deepEqual(payload.projects.map(project => project.id), ['Ash']);
  assert.equal(Object.hasOwn(payload, 'sourceAccess'), false);
  assert.match(payload.authority, /selects public source material/);
});

test('older inventories without privateEntries report an absent source as unlisted', () => {
  const { privateEntries, ...older } = inventory;
  const { payload } = packetFor({ text: 'Cedar' }, older);
  assert.deepEqual(payload.sourceAccess.projects, [{ id: 'Cedar', status: 'unlisted' }]);
});

test('inventory ids match case-insensitively and keep the catalog spelling', () => {
  const { payload } = packetFor({ filters: { fork: ['no'] } }, {
    ...inventory, privateEntries: [{ ...inventory.privateEntries[0], id: 'cEDAr' }],
    repositories: [{ id: 'aSH', public: true }],
  });
  assert.deepEqual(payload.sourceAccess.projects, [{ id: 'Ash', status: 'public' }, { id: 'Cedar', status: 'private' }]);
});

test('an inventory change to a selected source requires a new handoff', () => {
  const input = { text: 'Cedar' };
  const packet = packetFor(input);
  const updated = { ...inventory, repositories: [...inventory.repositories, { id: 'Cedar', public: true }], privateEntries: [] };
  assert.throws(() => verifyHandoff(catalog, packet, packet.digest, updated), /declared selection/);
  const fresh = packetFor(input, updated);
  assert.notEqual(fresh.digest, packet.digest);
  assert.equal(verifyHandoff(catalog, fresh, fresh.digest, updated).verified, true);
});

test('changes to unselected entries and private-entry reasons stay outside the packet', () => {
  const packet = packetFor({ text: 'Cedar' });
  const other = {
    ...inventory, repositories: [],
    privateEntries: [{ id: 'Ash', reason: 'Separate record.' }, { id: 'Cedar', reason: 'Updated public note.' }],
  };
  assert.deepEqual(packetFor({ text: 'Cedar' }, other), packet);
  assert.equal(verifyHandoff(catalog, packet, packet.digest, other).verified, true);
});

test('verification rejects a legacy blanket-public packet for a documented private source', () => {
  const previous = packetFor({ text: 'Cedar' }, { ...inventory, repositories: [{ id: 'Cedar', public: true }], privateEntries: [] });
  assert.throws(() => verifyHandoff(catalog, previous, previous.digest, inventory), /declared selection/);
});

test('the CLI writes and verifies the access labels from its bundled public inventory', t => {
  const dir = mkdtempSync(join(tmpdir(), 'handoff-access-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const cli = fileURLToPath(new URL('../cli.mjs', import.meta.url));
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [cli, ...args], { cwd: dir, encoding: 'utf8' }));
  const saved = readJson(new URL('../public-inventory.json', import.meta.url));
  const publicIds = new Set(saved.repositories.map(project => project.id.toLowerCase()));
  const privateIds = new Set((saved.privateEntries ?? []).map(project => project.id.toLowerCase()));
  writeFileSync(join(dir, 'query.json'), JSON.stringify({ version: 1 }));
  const { digest } = run('handoff', 'query.json', 'packet.json');
  const { payload } = readJson(join(dir, 'packet.json'));
  assert.equal(run('verify-handoff', 'packet.json', digest).projectCount, loadCatalog().projects.length);
  for (const { id } of payload.projects) {
    const key = id.toLowerCase();
    const row = payload.sourceAccess?.projects.find(entry => entry.id === id);
    if (privateIds.has(key)) assert.equal(row?.status, 'private', id);
    else if (!publicIds.has(key)) assert.equal(row?.status, 'unlisted', id);
    else if (payload.sourceAccess) assert.equal(row?.status, 'public', id);
  }
});
