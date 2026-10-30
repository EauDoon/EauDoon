import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCatalog } from '../lib/catalog.mjs';

// Hand-written docs cite source files "at the assessed revision". A citation
// pinned to an older commit silently stops meaning that once the catalog is
// re-pinned, so every pinned blob or tree link to a catalogued EauDoon
// project must use that project's current catalog revision. The changelog,
// audits and the generated guide are history or generated, and are not read.
const documents = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'docs/DISCOVERY.md', 'docs/WORKFLOWS.md'];

export function staleCitations(text, catalog) {
  const pins = new Map(catalog.projects.map(p => [p.id.toLowerCase(), p]));
  const problems = [];
  // The revision may end the link (a pinned repository root), or be followed
  // by a path, fragment, query or the link's closing punctuation.
  for (const match of text.matchAll(/https:\/\/github\.com\/EauDoon\/([^/\s"'<>()#?]+)\/(?:blob|tree)\/([0-9a-f]{40})(?![\w.-])/g)) {
    const project = pins.get(match[1].toLowerCase());
    if (project && match[2] !== project.source.revision) problems.push(`${project.id}: cites ${match[2].slice(0, 7)}, but the catalog pins ${project.source.revision.slice(0, 7)}`);
  }
  return problems;
}

test('pinned source citations in the docs use the catalog revision', () => {
  const catalog = loadCatalog();
  for (const name of documents) {
    const text = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
    assert.deepEqual(staleCitations(text, catalog), [], `${name}: re-check the cited file at the new pin, then move the link`);
  }
});

test('a citation pinned to another revision of a catalog project is reported by name', () => {
  const catalog = loadCatalog();
  const project = catalog.projects.find(p => p.id === 'operator-labs');
  const other = 'b'.repeat(40);
  const text = [
    `[ok](https://github.com/EauDoon/operator-labs/blob/${project.source.revision}/README.md)`,
    `[stale](https://github.com/EauDoon/Operator-Labs/tree/${other}/src/)`,
    `[uncatalogued](https://github.com/EauDoon/not-in-catalog/blob/${other}/README.md)`,
    '[branch](https://github.com/EauDoon/operator-labs/blob/main/README.md)',
  ].join('\n');
  assert.deepEqual(staleCitations(text, catalog), [`operator-labs: cites bbbbbbb, but the catalog pins ${project.source.revision.slice(0, 7)}`]);
});

test('a citation of a pinned repository root, with no path after the revision, is checked too', () => {
  const catalog = loadCatalog();
  const project = catalog.projects.find(p => p.id === 'operator-labs');
  const other = 'b'.repeat(40);
  const stale = `operator-labs: cites bbbbbbb, but the catalog pins ${project.source.revision.slice(0, 7)}`;
  for (const link of [`tree/${other}`, `[root](https://github.com/EauDoon/operator-labs/tree/${other})`, `tree/${other}#readme`, `tree/${other}?plain=1`, `blob/${other}/README.md`]) {
    const text = link.startsWith('[') ? link : `https://github.com/EauDoon/operator-labs/${link}`;
    assert.deepEqual(staleCitations(text, catalog), [stale], text);
  }
  assert.deepEqual(staleCitations(`https://github.com/EauDoon/operator-labs/tree/${project.source.revision}`, catalog), []);
  // A longer hex run is a branch name, not a 40-character revision.
  assert.deepEqual(staleCitations(`https://github.com/EauDoon/operator-labs/tree/${other}ff`, catalog), []);
});
