import { runQuery } from './query.mjs';

export function diagnoseQuery(catalog, query) {
  const matches = runQuery(catalog, query); const matched = new Set(matches.map(p => p.id));
  const eligible = runQuery(catalog, { ...query, text: '', filters: {} });
  const constraints = [...(query.text ? ['text'] : []), ...Object.keys(query.filters).sort()];
  const nearMisses = eligible.filter(p => !matched.has(p.id)).map(p => ({
    id: p.id,
    failedConstraints: constraints.filter(key => runQuery({ projects: [p] }, { version: 1, text: key === 'text' ? query.text : '', filters: key === 'text' ? {} : { [key]: query.filters[key] }, exclude: [] }).length === 0),
  })).sort((a, b) => a.failedConstraints.length - b.failedConstraints.length);
  const relaxations = constraints.map(key => {
    const relaxed = { ...query, filters: { ...query.filters } };
    if (key === 'text') relaxed.text = ''; else delete relaxed.filters[key];
    const results = runQuery(catalog, relaxed);
    return { omittedConstraint: key, matchCount: results.length, additionalProjects: results.filter(p => !matched.has(p.id)).map(p => p.id) };
  });
  return { assessedOn: catalog.assessedOn, query, matchingIds: matches.map(p => p.id), excludedCount: catalog.projects.length - eligible.length, nearMissCount: nearMisses.length, nearMisses: nearMisses.slice(0, 50), singleConstraintRelaxations: relaxations,
    note: 'Diagnostic only: the query is unchanged. Exclusions are always preserved. Near misses are ordered by failed-constraint count, not quality; at most 50 are shown.' };
}
