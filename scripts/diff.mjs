import { loadCatalog, errorMessage } from '../lib/catalog.mjs';
import { diffSnapshots } from '../lib/snapshot.mjs';

try {
  const args = process.argv.slice(2);
  if (args.length < 2 || args.length > 3 || args.slice(0, 2).some(x => x.startsWith('--')) || args.length === 3 && args[2] !== '--json') throw new Error('Usage: node scripts/diff.mjs BEFORE.json AFTER.json [--json]');
  const diff = diffSnapshots(loadCatalog(args[0]), loadCatalog(args[1]));
  if (args[2]) console.log(JSON.stringify(diff, null, 2));
  else console.log(`Snapshot review: ${diff.beforeDate} -> ${diff.afterDate}\nMetadata: ${diff.metadataChanged.join(', ') || 'unchanged'}\nAdded: ${diff.added.join(', ') || 'none'}\nRemoved: ${diff.removed.join(', ') || 'none'}\nChanged:\n${diff.changed.map(x => `  ${x.id}: ${x.fields.join(', ')}`).join('\n') || '  none'}\nSource changes require renewed assessment; no updates were applied.`);
} catch (error) { console.error(`catalog diff: ${errorMessage(error)}`); process.exitCode = 1; }
