import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from '../lib/catalog.mjs';
import { diffSnapshots } from '../lib/snapshot.mjs';
import { parseArgs, renderReview } from '../scripts/diff.mjs';

test('importing the snapshot diff does not run the review', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', 'await import("./scripts/diff.mjs")'], {
    encoding: 'utf8', cwd: fileURLToPath(new URL('..', import.meta.url)), timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('the snapshot diff still rejects missing arguments', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/diff.mjs', import.meta.url))], { encoding: 'utf8', timeout: 10000 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage/);
});

test('the snapshot diff CLI prints the documented review and matches the library', () => {
  const script = fileURLToPath(new URL('../scripts/diff.mjs', import.meta.url));
  const before = loadCatalog();
  const after = structuredClone(before);
  after.projects.find(p => p.id === 'operator-labs').summary = 'Public discovery tools';
  after.projects = after.projects.filter(p => p.id !== 'mandatebound');
  after.assessedOn = new Date(Date.parse(before.assessedOn) + 86400000).toISOString().slice(0, 10);
  const dir = mkdtempSync(join(tmpdir(), 'catalog-diff-'));
  try {
    const beforePath = join(dir, 'before.json');
    const afterPath = join(dir, 'after.json');
    writeFileSync(beforePath, JSON.stringify(before));
    writeFileSync(afterPath, JSON.stringify(after));
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
    const text = run(beforePath, afterPath);
    assert.equal(text.status, 0, text.stderr);
    assert.equal(text.stdout, [
      `Snapshot review: ${before.assessedOn} -> ${after.assessedOn}`,
      'Metadata: assessedOn',
      'Added: none',
      'Removed: mandatebound',
      'Changed:',
      '  operator-labs: summary',
      'Source changes require renewed assessment; no updates were applied.',
      '',
    ].join('\n'));
    const json = run(beforePath, afterPath, '--json');
    assert.equal(json.status, 0, json.stderr);
    assert.deepEqual(JSON.parse(json.stdout), diffSnapshots(loadCatalog(beforePath), loadCatalog(afterPath)));
    const same = run(beforePath, beforePath);
    assert.equal(same.status, 0, same.stderr);
    assert.match(same.stdout, /\nMetadata: unchanged\nAdded: none\nRemoved: none\nChanged:\n {2}none\n/);
    const yaml = run(beforePath, afterPath, '--yaml');
    assert.equal(yaml.status, 1);
    assert.match(yaml.stderr, /^catalog diff: Usage: node scripts\/diff\.mjs BEFORE\.json AFTER\.json \[--json\]/);
    assert.equal(yaml.stdout, '');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('snapshot review detects semantic changes and ignores project/key ordering', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  after.projects.reverse();
  after.projects[0] = Object.fromEntries(Object.entries(after.projects[0]).reverse());
  assert.deepEqual(diffSnapshots(before, after).changed, []);
  after.projects.find(p => p.id === 'operator-labs').summary = 'Public discovery tools';
  after.projects = after.projects.filter(p => p.id !== 'mandatebound');
  after.assessedOn = new Date(Date.parse(before.assessedOn) + 86400000).toISOString().slice(0, 10);
  const diff = diffSnapshots(before, after);
  assert.deepEqual(diff.removed, ['mandatebound']);
  assert.deepEqual(diff.changed, [{ id: 'operator-labs', fields: ['summary'] }]);
  assert.deepEqual(diff.metadataChanged, ['assessedOn']);
  assert.deepEqual(diffSnapshots(after, before).added, ['mandatebound']);
});

test('snapshot review reports catalog wave and schema metadata changes', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  after.portfolioWavesCompleted = [...before.portfolioWavesCompleted, 16];
  assert.deepEqual(diffSnapshots(before, after).metadataChanged, ['portfolioWavesCompleted']);
  const dropped = structuredClone(before);
  delete dropped.portfolioWavesCompleted;
  assert.deepEqual(diffSnapshots(before, dropped).metadataChanged, ['portfolioWavesCompleted']);
  const reordered = structuredClone(before);
  reordered.portfolioWavesCompleted = [...before.portfolioWavesCompleted].reverse();
  assert.deepEqual(diffSnapshots(before, reordered).metadataChanged, ['portfolioWavesCompleted']);
  const schema = structuredClone(before);
  schema.schemaVersion = 2;
  assert.deepEqual(diffSnapshots(before, schema).metadataChanged, ['schemaVersion']);
  assert.deepEqual(diffSnapshots(before, structuredClone(before)).metadataChanged, []);
});

test('snapshot review reports fields dropped from a retained project', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  delete after.projects.find(p => p.id === 'consequence-rail').lastAudited;
  delete after.projects.find(p => p.id === 'agent-team-os').source;
  assert.deepEqual(diffSnapshots(before, after).changed, [
    { id: 'agent-team-os', fields: ['source'] },
    { id: 'consequence-rail', fields: ['lastAudited'] },
  ]);
});

test('snapshot id lists follow catalog id order', () => {
  const after = loadCatalog();
  after.projects.find(p => p.id === 'operator-labs').id = 'Operator-Labs';
  const before = structuredClone(after);
  before.projects = before.projects.filter(p => p.id !== 'Operator-Labs' && p.id !== 'agent-action-stack');
  assert.deepEqual(diffSnapshots(before, after).added, ['agent-action-stack', 'Operator-Labs']);
  assert.deepEqual(diffSnapshots(after, before).removed, ['agent-action-stack', 'Operator-Labs']);
  const edited = structuredClone(after);
  for (const id of ['Operator-Labs', 'agent-action-stack']) edited.projects.find(p => p.id === id).summary += ' Updated';
  assert.deepEqual(diffSnapshots(after, edited).changed.map(row => row.id), ['agent-action-stack', 'Operator-Labs']);
});

test('changed field names ignore object key order', () => {
  const before = loadCatalog();
  const after = structuredClone(before);
  const project = after.projects.find(p => p.id === 'operator-labs');
  project.summary = 'Changed summary';
  project.boundary = 'Changed boundary';
  const reversed = structuredClone(before);
  reversed.projects = reversed.projects.map(entry => {
    const out = {};
    for (const key of Object.keys(entry).reverse()) out[key] = entry[key];
    return out;
  });
  const expected = [{ id: 'operator-labs', fields: ['summary', 'boundary'] }];
  assert.deepEqual(diffSnapshots(before, after).changed, expected);
  assert.deepEqual(diffSnapshots(reversed, after).changed, expected);
});

// A re-pin, a summary rewrite, a dropped field, an added and a removed entry,
// and an assessment date change, all on public ids.
function reviewFixture() {
  const before = loadCatalog();
  const after = structuredClone(before);
  const operator = after.projects.find(p => p.id === 'operator-labs');
  operator.summary = 'Public discovery tools';
  const revision = 'a'.repeat(40);
  const connect = after.projects.find(p => p.id === 'connect.md');
  connect.source = { revision, url: `${connect.repository}/blob/${revision}/README.md` };
  delete after.projects.find(p => p.id === 'consequence-rail').lastAudited;
  after.projects = after.projects.filter(p => p.id !== 'mandatebound');
  after.projects.push({ ...structuredClone(operator), id: 'synthetic-new-project', repository: 'https://github.com/EauDoon/synthetic-new-project',
    source: { revision, url: `https://github.com/EauDoon/synthetic-new-project/blob/${revision}/README.md` } });
  after.assessedOn = new Date(Date.parse(before.assessedOn) + 86400000).toISOString().slice(0, 10);
  return { before, after };
}

test('snapshot review without options keeps the names-only shape', () => {
  const { before, after } = reviewFixture();
  const diff = diffSnapshots(before, after);
  assert.deepEqual(Object.keys(diff), ['beforeDate', 'afterDate', 'metadataChanged', 'added', 'removed', 'changed']);
  assert.ok(diff.changed.every(row => Object.keys(row).join(',') === 'id,fields'));
  assert.deepEqual(diffSnapshots(before, after, {}), diff);
  assert.deepEqual(diffSnapshots(before, after, { values: false }), diff);
});

test('snapshot review with values shows before and after for every change', () => {
  const { before, after } = reviewFixture();
  const plain = diffSnapshots(before, after);
  const diff = diffSnapshots(before, after, { values: true });
  // The names-only fields are unchanged; values only add detail.
  for (const key of Object.keys(plain)) if (key !== 'changed') assert.deepEqual(diff[key], plain[key], key);
  assert.deepEqual(diff.changed.map(({ id, fields }) => ({ id, fields })), plain.changed);
  const row = id => diff.changed.find(change => change.id === id);
  const operator = before.projects.find(p => p.id === 'operator-labs');
  assert.deepEqual(row('operator-labs').values, [{ field: 'summary', before: operator.summary, after: 'Public discovery tools' }]);
  assert.equal(Object.hasOwn(row('operator-labs'), 'review'), false);
  const audited = row('consequence-rail').values;
  assert.deepEqual(audited, [{ field: 'lastAudited', before: before.projects.find(p => p.id === 'consequence-rail').lastAudited }]);
  assert.equal(Object.hasOwn(audited[0], 'after'), false);
  const connect = before.projects.find(p => p.id === 'connect.md');
  assert.equal(row('connect.md').review, `https://github.com/EauDoon/connect.md/compare/${connect.source.revision}...${'a'.repeat(40)}`);
  assert.equal(row('connect.md').values[0].before.revision, connect.source.revision);
  assert.deepEqual(diff.metadataValues, [{ field: 'assessedOn', before: before.assessedOn, after: after.assessedOn }]);
  assert.deepEqual(diff.addedProjects, [after.projects.find(p => p.id === 'synthetic-new-project')]);
  assert.deepEqual(diff.removedProjects, [before.projects.find(p => p.id === 'mandatebound')]);
  const same = diffSnapshots(before, structuredClone(before), { values: true });
  assert.deepEqual([same.changed, same.metadataValues, same.addedProjects, same.removedProjects], [[], [], [], []]);
});

test('metadata values omit the side that lacks a field', () => {
  const before = loadCatalog();
  const dropped = structuredClone(before);
  delete dropped.portfolioWavesCompleted;
  assert.deepEqual(diffSnapshots(before, dropped, { values: true }).metadataValues, [{ field: 'portfolioWavesCompleted', before: before.portfolioWavesCompleted }]);
  assert.deepEqual(diffSnapshots(dropped, before, { values: true }).metadataValues, [{ field: 'portfolioWavesCompleted', after: before.portfolioWavesCompleted }]);
});

test('diff arguments accept --json and --values once each, in any order', () => {
  assert.deepEqual(parseArgs(['a.json', 'b.json']), { before: 'a.json', after: 'b.json', json: false, values: false });
  assert.deepEqual(parseArgs(['a.json', 'b.json', '--json']), { before: 'a.json', after: 'b.json', json: true, values: false });
  assert.deepEqual(parseArgs(['a.json', 'b.json', '--values']), { before: 'a.json', after: 'b.json', json: false, values: true });
  assert.deepEqual(parseArgs(['a.json', 'b.json', '--values', '--json']), parseArgs(['a.json', 'b.json', '--json', '--values']));
  for (const args of [[], ['a.json'], ['--json', 'b.json'], ['a.json', '--values'], ['a.json', 'b.json', '--values', '--values'],
    ['a.json', 'b.json', '--other'], ['a.json', 'b.json', 'c.json'], ['a.json', 'b.json', '--json', '--values', '--json'], ['a.json', 'b.json', '-v']]) {
    assert.throws(() => parseArgs(args), error => error.message === 'Usage: node scripts/diff.mjs BEFORE.json AFTER.json [--json] [--values]', args.join(' '));
  }
});

test('the text review prints values only when they were requested', () => {
  const { before, after } = reviewFixture();
  const operator = before.projects.find(p => p.id === 'operator-labs');
  const connect = before.projects.find(p => p.id === 'connect.md');
  const removed = before.projects.find(p => p.id === 'mandatebound');
  const added = after.projects.find(p => p.id === 'synthetic-new-project');
  const names = [
    `Snapshot review: ${before.assessedOn} -> ${after.assessedOn}`,
    'Metadata: assessedOn',
    'Added: synthetic-new-project',
    'Removed: mandatebound',
    'Changed:',
    '  connect.md: source',
    '  consequence-rail: lastAudited',
    '  operator-labs: summary',
    'Source changes require renewed assessment; no updates were applied.',
  ];
  assert.equal(renderReview(diffSnapshots(before, after)), names.join('\n'));
  assert.equal(renderReview(diffSnapshots(before, after, { values: true })), [
    names[0], names[1],
    '  assessedOn:', `    before: ${before.assessedOn}`, `    after: ${after.assessedOn}`,
    names[2],
    '  synthetic-new-project', `    summary: ${added.summary}`, `    boundary: ${added.boundary}`, `    assessed README: ${added.source.url}`,
    names[3],
    '  mandatebound', `    summary: ${removed.summary}`, `    boundary: ${removed.boundary}`, `    assessed README: ${removed.source.url}`,
    names[4],
    names[5], '    source:', `      before: ${connect.source.revision}`, `      after: ${'a'.repeat(40)}`,
    `      review: https://github.com/EauDoon/connect.md/compare/${connect.source.revision}...${'a'.repeat(40)}`,
    names[6], '    lastAudited:', `      before: ${before.projects.find(p => p.id === 'consequence-rail').lastAudited}`, '      after: (absent)',
    names[7], '    summary:', `      before: ${operator.summary}`, '      after: Public discovery tools',
    names[8],
  ].join('\n'));
  const forks = structuredClone(before);
  forks.projects = forks.projects.filter(p => !p.fork);
  const tasks = structuredClone(before);
  tasks.projects.find(p => p.id === 'operator-labs').tasks.push('synthetic-task');
  const text = renderReview(diffSnapshots(forks, tasks, { values: true }));
  assert.match(text, /\nAdded: gauntlet-verify, hermes-agent, reflection-engine\n {2}gauntlet-verify \(fork\)\n/);
  const taskLines = /\n {4}tasks:\n {6}before: (.+)\n {6}after: (.+)\n/.exec(text);
  assert.ok(taskLines, text);
  assert.equal(taskLines[2], `${taskLines[1]}, synthetic-task`);
});

test('the snapshot diff CLI prints values with --values and keeps JSON flags order-free', () => {
  const script = fileURLToPath(new URL('../scripts/diff.mjs', import.meta.url));
  const { before, after } = reviewFixture();
  const dir = mkdtempSync(join(tmpdir(), 'catalog-diff-values-'));
  try {
    const beforePath = join(dir, 'before.json');
    const afterPath = join(dir, 'after.json');
    writeFileSync(beforePath, JSON.stringify(before));
    writeFileSync(afterPath, JSON.stringify(after));
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 10000 });
    const text = run(beforePath, afterPath, '--values');
    assert.equal(text.status, 0, text.stderr);
    assert.equal(text.stdout, `${renderReview(diffSnapshots(before, after, { values: true }))}\n`);
    const first = run(beforePath, afterPath, '--json', '--values');
    const second = run(beforePath, afterPath, '--values', '--json');
    assert.equal(first.status, 0, first.stderr);
    assert.equal(first.stdout, second.stdout);
    assert.deepEqual(JSON.parse(first.stdout), diffSnapshots(before, after, { values: true }));
    for (const args of [[beforePath, afterPath, '--values', '--values'], [beforePath, afterPath, '--other'], [beforePath, afterPath, afterPath]]) {
      const failed = run(...args);
      assert.equal(failed.status, 1);
      assert.match(failed.stderr, /^catalog diff: Usage: node scripts\/diff\.mjs BEFORE\.json AFTER\.json \[--json\] \[--values\]\r?\n$/);
      assert.equal(failed.stdout, '');
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
