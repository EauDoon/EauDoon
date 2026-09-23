import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectDrift } from '../scripts/drift.mjs';
import { loadCatalog } from '../lib/catalog.mjs';

function writeCatalog(tmp, name, data) {
  const path = join(tmp, name);
  writeFileSync(path, JSON.stringify(data));
  return path;
}

function baseProject(id, overrides = {}) {
  const sha = 'a'.repeat(40);
  return {
    id,
    repository: `https://github.com/EauDoon/${id}`,
    summary: 'A fixture project',
    category: 'agent-workflows',
    runtimes: ['node'],
    privacy: 'public-content',
    tasks: ['shortlist'],
    boundary: 'No live effect',
    fork: false,
    source: {
      revision: sha,
      url: `https://github.com/EauDoon/${id}/blob/${sha}/README.md`,
    },
    ...overrides,
  };
}

function makeCatalog(projects, overrides = {}) {
  return {
    schemaVersion: 1,
    assessedOn: '2026-09-23',
    assessment: 'Synthetic catalog for drift detection tests.',
    portfolioWavesCompleted: [1, 2],
    projects,
    ...overrides,
  };
}

test('passes when per-project waves equal the top-level set', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'drift-'));
  try {
    const catalog = makeCatalog([
      baseProject('fixture-a', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
      baseProject('fixture-b', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
    ]);
    const path = writeCatalog(tmp, 'ok.json', catalog);
    const result = detectDrift(loadCatalog(path));
    assert.deepEqual(result.issues, []);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('passes when a top-level wave has no per-project record (global-only phase)', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
  ], { portfolioWavesCompleted: [1, 2, 9] });
  const result = detectDrift(catalog);
  assert.deepEqual(result.issues, []);
});

test('flags a per-project wave that is missing from the top-level set', () => {
  const catalog = makeCatalog(
    [
      baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
      baseProject('fixture-b', { wavesTouched: [1, 2, 7], lastAudited: '2026-09-23' }),
    ],
    { portfolioWavesCompleted: [1, 2] }
  );
  const result = detectDrift(catalog);
  assert.ok(result.issues.some(i => i.includes('wave 7') && i.includes('missing')));
});

test('flags when project lastAudited is newer than catalog.assessedOn', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-30' }),
    baseProject('fixture-b', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ], { assessedOn: '2026-09-23' });
  const result = detectDrift(catalog);
  assert.ok(result.issues.some(i => i.includes('lastAudited 2026-09-30 is newer')));
});

test('flags when the catalog.assessedOn is too old', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ], { assessedOn: '2026-06-01' });
  const result = detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 45 });
  assert.ok(result.issues.some(i => i.includes('days old')));
});

test('does not flag age when within tolerance', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ], { assessedOn: '2026-08-15' });
  const result = detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 60 });
  assert.equal(result.issues.filter(i => i.includes('days old')).length, 0);
});

test('flags duplicate project ids', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ]);
  const result = detectDrift(catalog);
  assert.ok(result.issues.some(i => i.includes('duplicate project id')));
});

test('exposes summary statistics', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
    baseProject('fixture-c', { wavesTouched: [1] }),
  ]);
  const result = detectDrift(catalog);
  assert.equal(result.summary.projects, 3);
  assert.equal(result.summary.projectsWithWave, 3);
  assert.equal(result.summary.projectsWithAudit, 2);
  assert.deepEqual(result.summary.topLevel, [1, 2]);
  assert.deepEqual(result.summary.perWaveCounts, { 1: 3, 2: 2 });
});
