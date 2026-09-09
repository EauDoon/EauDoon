import { loadCatalog } from './lib/catalog.mjs';
import { search, summarize } from './lib/discover.mjs';

const help = `Offline public project discovery (Node.js 22+)
  node cli.mjs validate
  node cli.mjs list [--json]
  node cli.mjs search <words...> [--json]
No installs, network calls, telemetry or project execution.`;

try {
  const args = process.argv.slice(2);
  const command = args.shift() || 'help';
  if (command === 'help' || command === '--help') { console.log(help); process.exit(0); }
  if (!['validate', 'list', 'search'].includes(command)) throw new Error(`Unknown command.\n${help}`);
  const json = args.includes('--json');
  if (args.filter(a => a === '--json').length > 1 || args.some(a => a.startsWith('--') && a !== '--json')) throw new Error('Unknown or repeated option');
  const positional = args.filter(a => a !== '--json');
  if (command !== 'search' && positional.length || command === 'validate' && json || command === 'search' && !positional.length) throw new Error(`Invalid arguments.\n${help}`);
  const catalog = loadCatalog();
  if (command === 'validate') console.log(`Valid catalog: ${catalog.projects.length} public projects`);
  else {
    const projects = search(catalog.projects, positional.join(' '));
    console.log(json ? JSON.stringify({ assessedOn: catalog.assessedOn, assessment: catalog.assessment, projects }, null, 2) : summarize(projects));
  }
} catch (error) {
  console.error(`catalog: ${error.message}`);
  process.exitCode = 1;
}
