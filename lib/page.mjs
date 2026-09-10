import { fingerprint } from './identity.mjs';
import { runQuery } from './query.mjs';

export function pageResults(catalog, query, size, cursor) {
  if (!Number.isInteger(size) || size < 1 || size > 100) throw new Error('Page size must be an integer from 1 to 100');
  const projects = runQuery(catalog, query);
  const context = fingerprint({ catalog, query, size });
  let offset = 0;
  if (cursor !== undefined) {
    if (typeof cursor !== 'string' || cursor.length > 256 || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error('Invalid page cursor');
    let parsed;
    try { parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(cursor, 'base64url'))); }
    catch { throw new Error('Invalid page cursor'); }
    if (!parsed || Object.keys(parsed).sort().join(',') !== 'context,offset' || parsed.context !== context || !Number.isInteger(parsed.offset) || parsed.offset < 0 || parsed.offset >= projects.length) throw new Error('Cursor does not match this query, page size or catalog');
    offset = parsed.offset;
  }
  const token = start => Buffer.from(JSON.stringify({ context, offset: start })).toString('base64url');
  return { assessedOn: catalog.assessedOn, total: projects.length, offset, size, projects: projects.slice(offset, offset + size), next: offset + size < projects.length ? token(offset + size) : null, previous: offset > 0 ? token(Math.max(0, offset - size)) : null };
}
