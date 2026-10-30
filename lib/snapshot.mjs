const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : 1)) : v);
const byId = (a, b) => {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};
const projectFields = ['id', 'repository', 'summary', 'category', 'runtimes', 'privacy', 'tasks', 'boundary', 'fork', 'wavesTouched', 'lastAudited', 'source'];
const byField = (a, b) => {
  const ia = projectFields.indexOf(a);
  const ib = projectFields.indexOf(b);
  if (ia === -1 && ib === -1) return a < b ? -1 : a > b ? 1 : 0;
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
};
// One changed field with both sides. A side that lacks the field omits its key,
// so a dropped boundary or lastAudited is explicit rather than an empty value.
const pair = (field, from, to) => ({
  field,
  ...(Object.hasOwn(from, field) ? { before: from[field] } : {}),
  ...(Object.hasOwn(to, field) ? { after: to[field] } : {}),
});

// Without options.values the result is exactly the names-only review. With it,
// each change also carries its before and after values, every re-pin carries a
// compare URL for reviewing the upstream changes, and added and removed
// projects carry their complete records.
export function diffSnapshots(before, after, options = {}) {
  const previous = new Map(before.projects.map(p => [p.id.toLowerCase(), p]));
  const next = new Map(after.projects.map(p => [p.id.toLowerCase(), p]));
  const metadataKeys = ['schemaVersion', 'assessedOn', 'assessment', 'portfolioWavesCompleted'];
  // Deep-compare: a cloned wave list is a new array, and key order is not a change.
  // Array order stays significant, matching the rest of the snapshot review.
  const metadataChanged = metadataKeys.filter(key => stable(before[key]) !== stable(after[key]));
  const added = [...next.keys()].filter(id => !previous.has(id)).map(id => next.get(id).id).sort(byId);
  const removed = [...previous.keys()].filter(id => !next.has(id)).map(id => previous.get(id).id).sort(byId);
  const changed = after.projects.filter(p => previous.has(p.id.toLowerCase())).map(p => p.id).sort(byId).flatMap(id => {
    const key = id.toLowerCase();
    const [from, to] = [previous.get(key), next.get(key)];
    // Union the keys: a field dropped from the newer snapshot is a change too,
    // and a deleted source pin or boundary must not read as "no change".
    const fields = [...new Set([...Object.keys(from), ...Object.keys(to)])].sort(byField).filter(field => stable(from[field]) !== stable(to[field]));
    if (!fields.length) return [];
    if (!options.values) return [{ id, fields }];
    const row = { id, fields, values: fields.map(field => pair(field, from, to)) };
    // Both sides passed the schema, so each repository is the exact public
    // owner URL and each revision is 40 lowercase hex characters. An id
    // casing fix moves source.url but keeps the revision: nothing to compare.
    if (fields.includes('source') && from.source && to.source && from.source.revision !== to.source.revision) row.review = `${to.repository}/compare/${from.source.revision}...${to.source.revision}`;
    return [row];
  });
  const diff = { beforeDate: before.assessedOn, afterDate: after.assessedOn, metadataChanged, added, removed, changed };
  if (!options.values) return diff;
  return {
    ...diff,
    metadataValues: metadataChanged.map(field => pair(field, before, after)),
    addedProjects: added.map(id => next.get(id.toLowerCase())),
    removedProjects: removed.map(id => previous.get(id.toLowerCase())),
  };
}
