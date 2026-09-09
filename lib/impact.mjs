import { normalizeQuery, runQuery } from './query.mjs';
import { catalogFingerprint } from './identity.mjs';
import { diffSnapshots } from './snapshot.mjs';

export function queryImpact(before, after, input) {
  // A previously valid task can disappear from the new catalog. Validate against
  // their combined vocabulary, then report lost matches instead of broadening.
  const query = normalizeQuery(input, { projects: [...before.projects, ...after.projects] });
  const left = runQuery(before, query); const right = runQuery(after, query);
  const previousIds = new Set(left.map(p => p.id)); const nextIds = new Set(right.map(p => p.id));
  const changes = diffSnapshots(before, after);
  return {
    beforeDigest: catalogFingerprint(before), afterDigest: catalogFingerprint(after), query,
    beforeCount: left.length, afterCount: right.length,
    entered: right.filter(p => !previousIds.has(p.id)).map(p => p.id),
    left: left.filter(p => !nextIds.has(p.id)).map(p => p.id),
    retained: right.filter(p => previousIds.has(p.id)).map(p => p.id),
    changedRetained: changes.changed.filter(p => previousIds.has(p.id) && nextIds.has(p.id)),
    metadataChanged: changes.metadataChanged,
    note: 'Same normalized query applied to both supplied snapshots. No catalog update or source promotion was performed.',
  };
}
