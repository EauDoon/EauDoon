import { normalizeQuery, runQuery } from './query.mjs';
import { catalogFingerprint, fingerprint } from './identity.mjs';

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
