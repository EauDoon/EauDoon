import { loadCatalog } from './lib/catalog.mjs';
import { search, summarize, parseOptions, filterProjects } from './lib/discover.mjs';

const help = `Offline public project discovery (Node.js 22+)
  node cli.mjs validate
  node cli.mjs list [--json]
  node cli.mjs search <words...> [--json]
List/search filters: --category VALUE --runtime VALUE --privacy VALUE --task VALUE --fork yes|no
Filters intersect. Invalid values print the available choices.
No installs, network calls, telemetry or project execution.`;

try {
  const args = process.argv.slice(2);
  const command = args.shift() || 'help';
  if (command === 'help' || command === '--help') { console.log(help); process.exit(0); }
  if (!['validate', 'list', 'search'].includes(command)) throw new Error(`Unknown command.\n${help}`);
  const catalog = loadCatalog();
  const { options, positional } = parseOptions(args, catalog.projects);
  if (command !== 'search' && positional.length || command === 'validate' && Object.keys(options).length || command === 'search' && !positional.length) throw new Error(`Invalid arguments.\n${help}`);
  if (command === 'validate') console.log(`Valid catalog: ${catalog.projects.length} public projects`);
  else {
    const projects = search(filterProjects(catalog.projects, options), positional.join(' '));
    console.log(options.json ? JSON.stringify({ assessedOn: catalog.assessedOn, assessment: catalog.assessment, projects }, null, 2) : summarize(projects));
  }
} catch (error) {
  console.error(`catalog: ${error.message}`);
  process.exitCode = 1;
}
