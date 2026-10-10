import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { detectDrift } from '../scripts/drift.mjs';
import { loadCatalog } from '../lib/catalog.mjs';

test('importing the drift detector does not run the check', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', 'await import("./scripts/drift.mjs")'], {
    encoding: 'utf8', cwd: fileURLToPath(new URL('..', import.meta.url)), timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('the drift report states audit coverage and names entries with no lastAudited', () => {
  const catalog = loadCatalog();
  const unaudited = catalog.projects.filter(p => !p.lastAudited).map(p => p.id);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url)), '--check', '--today', catalog.assessedOn], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(`audited=${catalog.projects.length - unaudited.length}/${catalog.projects.length}`));
  // With no gaps the report omits the line entirely, so both directions are pinned.
  const named = /^no lastAudited date recorded for: (.+)\.$/m.exec(result.stdout)?.[1];
  assert.equal(named, unaudited.length ? unaudited.join(', ') : undefined);
  assert.match(result.stdout, /no drift detected\./);
});

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
    // An explicit reference date keeps this pass from expiring 45 days after
    // the fixture's assessedOn.
    const result = detectDrift(loadCatalog(path), { today: '2026-09-23' });
    assert.deepEqual(result.issues, []);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('passes when a top-level wave has no per-project record (global-only phase)', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1, 2], lastAudited: '2026-09-23' }),
  ], { portfolioWavesCompleted: [1, 2, 9] });
  const result = detectDrift(catalog, { today: '2026-09-23' });
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

test('impossible lastAudited dates are not treated as audits', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-02-31' }),
    baseProject('fixture-b', { wavesTouched: [1], lastAudited: '9999' }),
    baseProject('fixture-c', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ], { assessedOn: '2026-09-23', portfolioWavesCompleted: [1] });
  const result = detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 45 });
  assert.equal(result.summary.projectsWithAudit, 1);
  assert.equal(result.summary.newestLastAudited, '2026-09-23');
  assert.equal(result.issues.filter(issue => issue.includes('lastAudited')).length, 0);
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

test('an invalid reference date is rejected instead of reporting no drift', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2020-01-01' }),
  ], { assessedOn: '2020-01-01', portfolioWavesCompleted: [1] });
  for (const today of ['not-a-date', '2026-02-31', '2026-09-31', '2026/09/23']) {
    assert.throws(() => detectDrift(catalog, { today, maxAgeDays: 1 }), /YYYY-MM-DD/, today);
  }
  const aged = detectDrift(catalog, { today: '2020-01-03', maxAgeDays: 1 });
  assert.ok(aged.issues.some(issue => issue.includes('days old')));
  const cli = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url)), '--check', '--today', 'not-a-date'], { encoding: 'utf8', timeout: 10000 });
  assert.equal(cli.status, 1, cli.stderr);
  assert.doesNotMatch(cli.stdout, /no drift detected/);
  assert.doesNotMatch(cli.stderr, /not-a-date/);
});

test('a future assessment fails both the detector and CLI', () => {
  const catalog = makeCatalog([baseProject('fixture-a')]);
  assert.deepEqual(detectDrift(catalog, { today: '2026-09-22' }).issues, [
    'catalog.assessedOn 2026-09-23 is later than referenceDate 2026-09-22',
  ]);
  assert.deepEqual(detectDrift(catalog, { today: catalog.assessedOn }).issues, []);
  const script = fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url));
  for (const mode of ['--check', '--json']) {
    const result = spawnSync(process.execPath, [script, mode, '--today', '2000-01-01'], { encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /later than referenceDate/);
    assert.doesNotMatch(result.stdout, /no drift detected/);
  }
});

test('an invalid maximum age is rejected instead of hiding staleness', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-01' }),
  ], { assessedOn: '2026-09-01', portfolioWavesCompleted: [1] });
  const flagged = detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 10 });
  assert.ok(flagged.issues.some(issue => issue.includes('limit 10')));
  for (const maxAgeDays of [0, -1, 1.5, Number.NaN, 1e21, 36501]) {
    assert.throws(() => detectDrift(catalog, { today: '2026-09-23', maxAgeDays }), /max-age-days/, String(maxAgeDays));
  }
  assert.equal(detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 30 }).issues.filter(issue => issue.includes('days old')).length, 0);
  assert.equal(detectDrift(catalog, { today: '2026-09-23' }).issues.filter(issue => issue.includes('days old')).length, 0);
});

test('drift rejects a max age that is not written as a decimal integer', () => {
  const script = fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url));
  const run = value => spawnSync(process.execPath, [script, '--check', '--max-age-days', value, '--today', loadCatalog().assessedOn], { encoding: 'utf8', timeout: 10000 });
  for (const value of ['45.0', '0x2d', '045', '+45', '1e2', '1e21', '36501']) {
    const result = run(value);
    assert.equal(result.status, 1, `${value} status ${result.status} stdout ${result.stdout}`);
    assert.match(result.stderr, /max-age-days/, value);
    assert.doesNotMatch(result.stdout, /no drift detected/, value);
    assert.doesNotMatch(result.stderr, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), value);
  }
  const ok = run('45');
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /no drift detected/);
});

test('the drift mode is optional, as its usage line says', () => {
  const script = fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url));
  const assessedOn = loadCatalog().assessedOn;
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
  for (const args of [['--today', assessedOn], ['--max-age-days', '45', '--today', assessedOn]]) {
    const result = run(...args);
    assert.equal(result.status, 0, `${args.join(' ')}: ${result.stderr}`);
    assert.match(result.stdout, /no drift detected\./);
  }
  const json = run('--json', '--today', assessedOn);
  assert.equal(json.status, 0, json.stderr);
  assert.equal(JSON.parse(json.stdout).referenceDate, assessedOn);
  const help = run('--help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^Usage: node scripts\/drift\.mjs \[--check\|--json\]/);
  assert.equal(help.stderr, '');
});

test('drift usage errors exit 2 and never echo the argument', () => {
  const script = fileURLToPath(new URL('../scripts/drift.mjs', import.meta.url));
  const assessedOn = loadCatalog().assessedOn;
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
  const escape = String.fromCharCode(27);
  const unknown = run('--bogus', `${escape}[31mX`);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /^drift: Unknown argument\nUsage: /);
  assert.ok(!unknown.stderr.includes(escape), 'stderr carries a raw terminal escape');
  assert.doesNotMatch(unknown.stderr, /bogus/);
  assert.equal(unknown.stdout, '');
  const hostile = run('--check', '--today', assessedOn, `${escape}]0;title${String.fromCharCode(7)}`);
  assert.equal(hostile.status, 2);
  assert.ok(!hostile.stderr.includes(escape), 'stderr carries a raw terminal escape');
  for (const [args, message] of [
    [['--check', '--today'], /^drift: Missing value for --today\n/],
    [['--max-age-days'], /^drift: Missing value for --max-age-days\n/],
    [['--today', '--json'], /^drift: Missing value for --today\n/],
    [['--today', 'a', '--today', 'b'], /^drift: Repeated option --today\n/],
    [['--json', '--max-age-days', '45', '--max-age-days', '46', '--today', assessedOn], /^drift: Repeated option --max-age-days\n/],
    [['--today', assessedOn, '--json'], /^drift: Unknown argument\n/],
  ]) {
    const result = run(...args);
    assert.equal(result.status, 2, `${args.join(' ')}: ${result.stderr}`);
    assert.match(result.stderr, message, args.join(' '));
    assert.doesNotMatch(result.stdout, /no drift detected/, args.join(' '));
  }
  // An invalid value is not a usage error: it keeps exit 1 and its own message.
  const invalid = run('--today', '2026-02-31');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /^drift: --today must be a real YYYY-MM-DD date\n$/);
});

test('does not flag age when within tolerance', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-b', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ], { assessedOn: '2026-08-15' });
  const result = detectDrift(catalog, { today: '2026-09-23', maxAgeDays: 60 });
  assert.equal(result.issues.filter(i => i.includes('days old')).length, 0);
});

test('a catalog with no projects is an issue, not a pass', () => {
  for (const catalog of [makeCatalog([]), { assessedOn: '2026-09-23' }]) {
    const result = detectDrift(catalog, { today: '2026-09-23' });
    assert.deepEqual(result.issues, ['catalog has no projects to check']);
    assert.equal(result.summary.projects, 0);
    assert.equal(result.referenceDate, '2026-09-23');
  }
});

test('flags duplicate project ids', () => {
  const catalog = makeCatalog([
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ]);
  const result = detectDrift(catalog);
  assert.ok(result.issues.some(i => i.includes('duplicate project id')));
});

test('flags project ids that differ only by case', () => {
  const catalog = makeCatalog([
    baseProject('Fixture-A', { wavesTouched: [1], lastAudited: '2026-09-23' }),
    baseProject('fixture-a', { wavesTouched: [1], lastAudited: '2026-09-23' }),
  ]);
  const result = detectDrift(catalog);
  assert.ok(result.issues.some(i => i.includes('duplicate project id')));
  assert.equal(result.issues.filter(i => i.includes('duplicate project id')).length, 1);
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
