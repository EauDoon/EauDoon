import { vocab } from './catalog.mjs';
import { search } from './discover.mjs';

const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export function normalizeQuery(input, catalog) {
  if (!object(input) || input.version !== 1 || Object.keys(input).some(k => !['version', 'text', 'filters', 'exclude'].includes(k))) throw new Error('Query requires version 1 and only text, filters, exclude fields');
  const text = input.text ?? '';
  if (typeof text !== 'string' || text.length > 256 || /[\p{Cc}\p{Cf}]/u.test(text)) throw new Error('Query text must be at most 256 visible characters');
  const allowed = { runtime: vocab.runtimes, category: vocab.category, privacy: vocab.privacy, task: [...new Set(catalog.projects.flatMap(p => p.tasks))], fork: ['yes', 'no'] };
  const supplied = input.filters ?? {};
  if (!object(supplied) || Object.keys(supplied).some(k => !Object.hasOwn(allowed, k))) throw new Error('Unknown query filter');
  const filters = {};
  for (const [key, values] of Object.entries(supplied)) {
    if (!Array.isArray(values) || values.length > 20 || new Set(values).size !== values.length || values.some(v => !allowed[key].includes(v))) throw new Error(`Invalid query filter: ${key}`);
    if (values.length) filters[key] = [...values].sort();
  }
  const exclude = input.exclude ?? [];
  if (!Array.isArray(exclude) || exclude.length > 100 || exclude.some(v => typeof v !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(v)) || new Set(exclude.map(v => v.toLowerCase())).size !== exclude.length) throw new Error('Invalid query exclusions');
  return { version: 1, text: text.trim(), filters, exclude: exclude.map(v => v.toLowerCase()).sort() };
}
export function runQuery(catalog, query) {
  return search(catalog.projects, query.text).filter(p => !query.exclude.includes(p.id.toLowerCase()) && Object.entries(query.filters).every(([key, values]) => {
    const actual = key === 'runtime' ? p.runtimes : key === 'task' ? p.tasks : key === 'fork' ? [p.fork ? 'yes' : 'no'] : [p[key]];
    return values.some(v => actual.includes(v));
  }));
}
export function queryReport(catalog, query) {
  const projects = runQuery(catalog, query);
  return { assessedOn: catalog.assessedOn, assessment: catalog.assessment, query, total: projects.length, projects };
}
