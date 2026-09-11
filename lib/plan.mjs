import { runQuery } from './query.mjs';

export function requestedTasks(catalog, request) {
  const known = new Set(catalog.projects.flatMap(p => p.tasks));
  if (!request || Object.keys(request).join(',') !== 'tasks' || !Array.isArray(request.tasks) || !request.tasks.length || request.tasks.length > 10 || new Set(request.tasks).size !== request.tasks.length || request.tasks.some(t => !known.has(t))) throw new Error('Plan requires 1 to 10 distinct known task ids in a tasks array');
  return request.tasks;
}
export function coveragePlan(catalog, query, request, maximum) {
  const tasks = requestedTasks(catalog, request);
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 4) throw new Error('Maximum projects must be from 1 to 4');
  const candidates = runQuery(catalog, query).filter(p => p.tasks.some(t => tasks.includes(t)));
  if (candidates.length > 25) throw new Error('More than 25 candidates: narrow the query before planning');
  const coveredBy = projects => tasks.filter(t => projects.some(p => p.tasks.includes(t)));
  let best = []; let covered = []; let examined = 0;
  function visit(start, selected, size) {
    if (selected.length === size) {
      examined++;
      const matches = coveredBy(selected);
      if (matches.length > covered.length) { best = [...selected]; covered = matches; }
      return;
    }
    for (let i = start; i <= candidates.length - (size - selected.length); i++) visit(i + 1, [...selected, candidates[i]], size);
  }
  for (let size = 1; size <= Math.min(maximum, candidates.length); size++) {
    visit(0, [], size);
    if (covered.length === tasks.length) break;
  }
  return { assessedOn: catalog.assessedOn, query, requestedTasks: tasks, maximumProjects: maximum, candidateCount: candidates.length, combinationsExamined: examined, coveredTasks: covered, missingTasks: tasks.filter(t => !covered.includes(t)), projects: best,
    note: 'Enumerates bounded combinations: most declared task coverage, then fewest projects, then id order. Shared tags do not establish integration compatibility, safety or authority.' };
}
