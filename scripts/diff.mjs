import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadCatalog, errorMessage } from '../lib/catalog.mjs';
import { diffSnapshots } from '../lib/snapshot.mjs';

const usage = 'Usage: node scripts/diff.mjs BEFORE.json AFTER.json [--json] [--values]';

// Two snapshot paths, then --json and --values in either order, each at most
// once. Anything else is a usage error that never echoes the arguments.
export function parseArgs(args) {
  const [before, after, ...flags] = args;
  if (args.length < 2 || args.length > 4 || [before, after].some(x => x.startsWith('--'))
    || flags.some(flag => !['--json', '--values'].includes(flag)) || new Set(flags).size !== flags.length) throw new Error(usage);
  return { before, after, json: flags.includes('--json'), values: flags.includes('--values') };
}

// Catalog text is schema-checked (no control or format characters), so values
// print as they are. A side without the field prints as (absent).
const shown = (field, value) => {
  if (value === undefined) return '(absent)';
  if (field === 'source') return value.revision;
  return Array.isArray(value) ? value.join(', ') : String(value);
};
const valueLines = (indent, row, review) => [
  `${indent}${row.field}:`,
  `${indent}  before: ${shown(row.field, row.before)}`,
  `${indent}  after: ${shown(row.field, row.after)}`,
  ...(review ? [`${indent}  review: ${review}`] : []),
];
const recordLines = project => [
  `  ${project.id}${project.fork ? ' (fork)' : ''}`,
  `    summary: ${project.summary}`,
  `    boundary: ${project.boundary}`,
  `    assessed README: ${project.source.url}`,
];

// The text review. Without values it is the names-only report; with values
// each change also shows what it was and what it becomes.
export function renderReview(diff) {
  const values = Object.hasOwn(diff, 'metadataValues');
  const lines = [`Snapshot review: ${diff.beforeDate} -> ${diff.afterDate}`, `Metadata: ${diff.metadataChanged.join(', ') || 'unchanged'}`];
  if (values) for (const row of diff.metadataValues) lines.push(...valueLines('  ', row));
  lines.push(`Added: ${diff.added.join(', ') || 'none'}`);
  if (values) for (const project of diff.addedProjects) lines.push(...recordLines(project));
  lines.push(`Removed: ${diff.removed.join(', ') || 'none'}`);
  if (values) for (const project of diff.removedProjects) lines.push(...recordLines(project));
  lines.push('Changed:');
  if (!diff.changed.length) lines.push('  none');
  for (const change of diff.changed) {
    lines.push(`  ${change.id}: ${change.fields.join(', ')}`);
    if (values) for (const row of change.values) lines.push(...valueLines('    ', row, row.field === 'source' ? change.review : undefined));
  }
  lines.push('Source changes require renewed assessment; no updates were applied.');
  return lines.join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const diff = diffSnapshots(loadCatalog(options.before), loadCatalog(options.after), { values: options.values });
  console.log(options.json ? JSON.stringify(diff, null, 2) : renderReview(diff));
}

function invokedAsCli() {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

// Importing this module must not parse argv or set a failing exit code.
if (invokedAsCli()) {
  try { main(); } catch (error) { console.error(`catalog diff: ${errorMessage(error)}`); process.exitCode = 1; }
}
