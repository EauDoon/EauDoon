import { loadCatalog } from './lib/catalog.mjs';
import { workflows } from './lib/workflows.mjs';
import { search, summarize, parseOptions, filterProjects, selectProject, detail, renderDetail, compare, renderComparison, taskIndex, shortlist } from './lib/discover.mjs';

const help = `Offline public project discovery (Node.js 22+)
  node cli.mjs validate
  node cli.mjs list [--json]
  node cli.mjs search <words...> [--json]
  node cli.mjs show <project-id> [--json]
  node cli.mjs compare <id> <id> [up to 6 ids] [--json]
  node cli.mjs tasks [--json]
  node cli.mjs shortlist <task-id...> [filters] [--json]
List/search filters: --category VALUE --runtime VALUE --privacy VALUE --task VALUE --fork yes|no
Filters intersect. Invalid values print the available choices.
No installs, network calls, telemetry or project execution.`;

try {
  const args = process.argv.slice(2);
  let catalogPath;
  if (args[0] === '--catalog') {
    args.shift(); catalogPath = args.shift();
    if (!catalogPath || catalogPath.startsWith('--') || !args.length) throw new Error('Usage: node cli.mjs --catalog SNAPSHOT.json COMMAND [ARGS]');
  }
  const command = args.shift() || 'help';
  if (Object.hasOwn(workflows, command)) { console.log(JSON.stringify(workflows[command](loadCatalog(catalogPath), args), null, 2)); process.exit(0); }
  if (command === 'help' || command === '--help') { console.log(help + '\nArtifact workflows (JSON output): ' + Object.keys(workflows).join(', ') + '\nSee docs/WORKFLOWS.md for contracts and examples.'); process.exit(0); }
  if (!['validate', 'list', 'search', 'show', 'compare', 'tasks', 'shortlist'].includes(command)) throw new Error(`Unknown command.\n${help}`);
  const catalog = loadCatalog(catalogPath);
  const { options, positional } = parseOptions(args, catalog.projects);
  if (['validate', 'list'].includes(command) && positional.length || command === 'validate' && Object.keys(options).length || command === 'search' && !positional.length || command === 'show' && (positional.length !== 1 || Object.keys(options).some(k => k !== 'json'))) throw new Error(`Invalid arguments.\n${help}`);
  if (command === 'validate') console.log(`Valid catalog: ${catalog.projects.length} public projects`);
  else if (command === 'tasks') {
    if (positional.length || Object.keys(options).some(k => k !== 'json')) throw new Error('Tasks accepts only --json');
    const tasks = taskIndex(catalog.projects);
    console.log(options.json ? JSON.stringify(tasks, null, 2) : tasks.map(x => `${x.task}: ${x.projects.join(', ')}`).join('\n'));
  }
  else if (command === 'shortlist') {
    if (options.task) throw new Error('Supply shortlist tasks as positional ids, not --task');
    const matches = shortlist(catalog.projects, positional, options);
    const note = 'Ordered by declared task coverage, then id. Matching is not a quality score or deployment recommendation.';
    console.log(options.json ? JSON.stringify({ assessedOn: catalog.assessedOn, note, matches }, null, 2) : `${note}\n\n${matches.length ? matches.map(m => `${m.project.id}\n  Matches: ${m.matchedTasks.join(', ')}\n  Missing: ${m.missingTasks.join(', ') || 'none'}\n  Limit: ${m.project.boundary}`).join('\n\n') : 'No projects match.'}`);
  }
  else if (command === 'compare') {
    if (Object.keys(options).some(k => k !== 'json')) throw new Error('Compare accepts only --json');
    const projects = compare(catalog.projects, positional);
    console.log(options.json ? JSON.stringify({ assessedOn: catalog.assessedOn, projects }, null, 2) : `Static assessment: ${catalog.assessedOn}\n\n${renderComparison(projects)}`);
  }
  else if (command === 'show') {
    const project = detail(selectProject(catalog.projects, positional[0]), catalog.assessedOn);
    console.log(options.json ? JSON.stringify(project, null, 2) : renderDetail(project));
  }
  else {
    const projects = search(filterProjects(catalog.projects, options), positional.join(' '));
    console.log(options.json ? JSON.stringify({ assessedOn: catalog.assessedOn, assessment: catalog.assessment, projects }, null, 2) : summarize(projects));
  }
} catch (error) {
  console.error(`catalog: ${error.message}`);
  process.exitCode = 1;
}
