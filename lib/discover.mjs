export const ordered = projects => [...projects].sort((a, b) => a.id.toLowerCase() < b.id.toLowerCase() ? -1 : 1);
export function search(projects, query = '') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return ordered(projects.filter(p => {
    const text = [p.id, p.summary, p.category, ...p.tasks].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  }));
}
export function summarize(projects) {
  return projects.length ? projects.map(p => `${p.id}${p.fork ? ' (fork)' : ''}\n  ${p.summary}\n  ${p.repository}`).join('\n\n') : 'No projects match.';
}

export function selectProject(projects, id) {
  const project = projects.find(p => p.id.toLowerCase() === id.toLowerCase());
  if (!project) throw new Error(`Unknown project: ${id}. Use list or search to find an exact id.`);
  return project;
}
export function detail(project, assessedOn) {
  return {
    ...project, assessedOn,
    start: [
      `Read the assessed README: ${project.source.url}`,
      `Compare current instructions before setup: ${project.repository}/blob/main/README.md`,
      'Review the documented prerequisites, data handling and verification commands before installing or running the project.',
    ],
  };
}
export function renderDetail(p) {
  return `${p.id}${p.fork ? ' (fork)' : ''}\n${p.summary}\n\nCategory: ${p.category}\nRuntime choices/requirements: ${p.runtimes.join(', ')}\nData boundary: ${p.privacy}\nTasks: ${p.tasks.join(', ')}\n\nLimit: ${p.boundary}\n\nStatic assessment: ${p.assessedOn}\nSource revision: ${p.source.revision}\n\nStart here:\n${p.start.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
}
import { vocab } from './catalog.mjs';

export function parseOptions(args, projects) {
  const options = {};
  const positional = [];
  const allowed = { category: vocab.category, runtime: vocab.runtimes, privacy: vocab.privacy, task: [...new Set(projects.flatMap(p => p.tasks))], fork: ['yes', 'no'] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    const key = arg.slice(2);
    if (Object.hasOwn(options, key)) throw new Error(`Repeated option: ${arg}`);
    if (key === 'json') { options.json = true; continue; }
    if (!Object.hasOwn(allowed, key)) throw new Error(`Unknown option: ${arg}`);
    const value = args[++i];
    if (!allowed[key].includes(value)) throw new Error(`Invalid ${arg}. Choose: ${allowed[key].join(', ')}`);
    options[key] = value;
  }
  return { options, positional };
}
export function filterProjects(projects, options) {
  return projects.filter(p => (!options.category || p.category === options.category)
    && (!options.runtime || p.runtimes.includes(options.runtime))
    && (!options.privacy || p.privacy === options.privacy)
    && (!options.task || p.tasks.includes(options.task))
    && (!options.fork || p.fork === (options.fork === 'yes')));
}
export const markdown = value => String(value).replace(/[\\`*_{}\[\]()#+.!|<>]/g, '\\$&');
export function compare(projects, ids) {
  if (ids.length < 2 || ids.length > 6) throw new Error('Compare requires 2 to 6 distinct project ids');
  const chosen = ids.map(id => selectProject(projects, id));
  if (new Set(chosen.map(p => p.id)).size !== chosen.length) throw new Error('Compare requires distinct project ids');
  return chosen;
}
export function renderComparison(projects) {
  const row = values => `| ${values.map(markdown).join(' | ')} |`;
  return [row(['Field', ...projects.map(p => p.id)]), row(['---', ...projects.map(() => '---')]),
    ...['summary', 'category', 'runtimes', 'privacy', 'tasks', 'boundary', 'fork'].map(key => row([key, ...projects.map(p => Array.isArray(p[key]) ? p[key].join(', ') : p[key])])),
    row(['Assessed README', ...projects.map(p => p.source.url)]),
  ].join('\n');
}
export function taskIndex(projects) {
  return [...new Set(projects.flatMap(p => p.tasks))].sort().map(task => ({ task, projects: ordered(projects.filter(p => p.tasks.includes(task))).map(p => p.id) }));
}
export function shortlist(projects, tasks, options = {}) {
  const known = taskIndex(projects).map(x => x.task);
  if (!tasks.length || tasks.length > 10 || new Set(tasks).size !== tasks.length || tasks.some(task => !known.includes(task))) throw new Error('Shortlist requires 1 to 10 distinct known task ids. Use tasks to see choices.');
  const matches = ordered(filterProjects(projects, options)).map(p => ({ project: p, matchedTasks: tasks.filter(task => p.tasks.includes(task)), missingTasks: tasks.filter(task => !p.tasks.includes(task)) })).filter(p => p.matchedTasks.length);
  return matches.sort((a, b) => b.matchedTasks.length - a.matchedTasks.length);
}
