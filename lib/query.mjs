import { vocab } from './catalog.mjs';
import { search } from './discover.mjs';

const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export function normalizeQuery(input, catalog) {
  if (!object(input) || input.version !== 1 || Object.keys(input).some(k => !['version', 'text', 'filters', 'exclude'].includes(k))) throw new Error('Query requires version 1 and only text, filters, exclude fields');
  const text = Object.hasOwn(input, 'text') ? input.text : '';
  if (typeof text !== 'string' || text.length > 256 || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(text)) throw new Error('Query text must be at most 256 visible characters');
  if (text.length > 0 && text.trim().length === 0) throw new Error('Query text must contain a visible word');
  const allowed = { runtime: vocab.runtimes, category: vocab.category, privacy: vocab.privacy, task: [...new Set(catalog.projects.flatMap(p => p.tasks))], fork: ['yes', 'no'] };
  const supplied = Object.hasOwn(input, 'filters') ? input.filters : {};
  if (!object(supplied) || Object.keys(supplied).some(k => !Object.hasOwn(allowed, k))) throw new Error('Unknown query filter');
  const filters = {};
  for (const [key, values] of Object.entries(supplied)) {
    if (!Array.isArray(values) || values.length > 20 || new Set(values).size !== values.length || values.some(v => !allowed[key].includes(v))) throw new Error(`Invalid query filter: ${key}`);
    if (values.length) filters[key] = [...values].sort((a, b) => {
      const x = String(a).toLowerCase();
      const y = String(b).toLowerCase();
      if (x < y) return -1;
      if (x > y) return 1;
      return a < b ? -1 : a > b ? 1 : 0;
    });
  }
  const exclude = Object.hasOwn(input, 'exclude') ? input.exclude : [];
  if (!Array.isArray(exclude) || exclude.length > 100 || exclude.some(v => typeof v !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(v)) || new Set(exclude.map(v => v.toLowerCase())).size !== exclude.length) throw new Error('Invalid query exclusions');
  return { version: 1, text: text.trim(), filters, exclude: exclude.map(v => v.toLowerCase()).sort() };
}
function facetValues(project, key) {
  return key === 'runtime' ? project.runtimes : key === 'task' ? project.tasks
    : key === 'fork' ? [project.fork ? 'yes' : 'no'] : [project[key]];
}
export function runQuery(catalog, query) {
  return search(catalog.projects, query.text).filter(p => !query.exclude.includes(p.id.toLowerCase()) && Object.entries(query.filters).every(([key, values]) => {
    const actual = facetValues(p, key);
    return values.some(v => actual.includes(v));
  }));
}
export function queryReport(catalog, query) {
  const projects = runQuery(catalog, query);
  return { assessedOn: catalog.assessedOn, assessment: catalog.assessment, query, total: projects.length, projects };
}

export function facets(catalog, query) {
  const byText = (a, b) => {
    const x = String(a).toLowerCase();
    const y = String(b).toLowerCase();
    if (x < y) return -1;
    if (x > y) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  };
  const choices = { runtime: vocab.runtimes, category: vocab.category, privacy: vocab.privacy, fork: ['yes', 'no'], task: [...new Set(catalog.projects.flatMap(p => p.tasks))].sort(byText) };
  const counts = Object.fromEntries(Object.keys(choices).map(key => [key, new Map()]));
  const excluded = new Set(query.exclude);
  const filters = Object.entries(query.filters);
  let total = 0;
  for (const p of search(catalog.projects, query.text)) {
    if (excluded.has(p.id.toLowerCase())) continue;
    const missed = filters.filter(([key, values]) => !values.some(v => facetValues(p, key).includes(v)));
    if (!missed.length) total++;
    // Replacing one field cannot rescue a project missing two filters.
    const keys = missed.length === 0 ? Object.keys(choices) : missed.length === 1 ? [missed[0][0]] : [];
    for (const key of keys) for (const value of new Set(facetValues(p, key))) {
      counts[key].set(value, (counts[key].get(value) ?? 0) + 1);
    }
  }
  return {
    assessedOn: catalog.assessedOn, query, total,
    note: 'Each count replaces that one filter with the named value, preserving all other constraints and exclusions.',
    facets: Object.fromEntries(Object.entries(choices).map(([key, values]) => [key, values.map(value => ({ value, selected: query.filters[key]?.includes(value) ?? false, count: counts[key].get(value) ?? 0 }))])),
  };
}
