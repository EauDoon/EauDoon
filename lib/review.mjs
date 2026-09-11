import { normalizeQuery, runQuery } from './query.mjs';
import { catalogFingerprint, fingerprint } from './identity.mjs';
import { requestedTasks } from './plan.mjs';
import { validDate } from './catalog.mjs';

export function batchQueries(catalog, input) {
  if (!input || Object.keys(input).sort().join(',') !== 'queries,version' || input.version !== 1 || !Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 20) throw new Error('Batch requires version 1 and 1 to 20 named queries');
  const names = new Set();
  const queries = input.queries.map(row => {
    if (!row || Object.keys(row).sort().join(',') !== 'id,query' || typeof row.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(row.id) || names.has(row.id.toLowerCase())) throw new Error('Batch query ids must be distinct visible slugs');
    names.add(row.id.toLowerCase());
    return { id: row.id, query: normalizeQuery(row.query, catalog) };
  });
  const results = queries.map(({ id, query }) => {
    const ids = runQuery(catalog, query).map(p => p.id);
    return { id, query, queryDigest: fingerprint(query), total: ids.length, ids };
  });
  return { assessedOn: catalog.assessedOn, catalogDigest: catalogFingerprint(catalog), queryCount: results.length, emptyCount: results.filter(row => !row.total).length, results };
}

export function coverageMatrix(catalog, query, request) {
  const tasks = requestedTasks(catalog, request);
  const projects = runQuery(catalog, query);
  if (projects.length > 100) throw new Error('Coverage supports at most 100 projects; narrow the query');
  const rows = tasks.map(task => ({ task, coveredBy: projects.filter(p => p.tasks.includes(task)).map(p => p.id) }));
  return { assessedOn: catalog.assessedOn, catalogDigest: catalogFingerprint(catalog), query, rows, missingTasks: rows.filter(row => !row.coveredBy.length).map(row => row.task), projects: projects.map(({ id, boundary, source }) => ({ id, boundary, source })), note: 'Declared task coverage only. Shared tags do not establish integration compatibility or execution authority.' };
}

export function compareQueries(catalog, beforeInput, afterInput) {
  const { results: [before, after], catalogDigest, assessedOn } = batchQueries(catalog, { version: 1, queries: [{ id: 'before', query: beforeInput }, { id: 'after', query: afterInput }] });
  const previous = new Set(before.ids); const next = new Set(after.ids);
  return { assessedOn, catalogDigest, before, after, changedConstraints: ['text', 'filters', 'exclude'].filter(key => fingerprint(before.query[key]) !== fingerprint(after.query[key])), entered: after.ids.filter(id => !previous.has(id)), left: before.ids.filter(id => !next.has(id)), shared: after.ids.filter(id => previous.has(id)), note: 'Compares two briefs against the same static catalog. Membership changes are not a quality ranking or permission to broaden requirements.' };
}

export function freshness(catalog, asOf, maximumDays) {
  if (!validDate(asOf)) throw new Error('As-of date must be a valid YYYY-MM-DD calendar date');
  if (!Number.isInteger(maximumDays) || maximumDays < 0 || maximumDays > 36500) throw new Error('Maximum age must be an integer from 0 to 36500 days');
  const ageDays = (Date.parse(asOf) - Date.parse(catalog.assessedOn)) / 86400000;
  return { assessedOn: catalog.assessedOn, asOf, maximumDays, ageDays, status: ageDays < 0 ? 'future-assessment' : ageDays > maximumDays ? 'stale' : 'within-threshold', catalogDigest: catalogFingerprint(catalog), note: 'Age of the declared catalog assessment only. Does not check source changes, availability, project maintenance or security.' };
}
