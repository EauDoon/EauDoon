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
export function diffSnapshots(before, after) {
  const previous = new Map(before.projects.map(p => [p.id.toLowerCase(), p]));
  const next = new Map(after.projects.map(p => [p.id.toLowerCase(), p]));
  const metadataKeys = ['schemaVersion', 'assessedOn', 'assessment', 'portfolioWavesCompleted'];
  return {
    beforeDate: before.assessedOn, afterDate: after.assessedOn,
    // Deep-compare: a cloned wave list is a new array, and key order is not a change.
    // Array order stays significant, matching the rest of the snapshot review.
    metadataChanged: metadataKeys.filter(key => stable(before[key]) !== stable(after[key])),
    added: [...next.keys()].filter(id => !previous.has(id)).map(id => next.get(id).id).sort(byId),
    removed: [...previous.keys()].filter(id => !next.has(id)).map(id => previous.get(id).id).sort(byId),
    changed: after.projects.filter(p => previous.has(p.id.toLowerCase())).map(p => p.id).sort(byId).flatMap(id => {
      const key = id.toLowerCase();
      // Union the keys: a field dropped from the newer snapshot is a change too,
      // and a deleted source pin or boundary must not read as "no change".
      const fields = [...new Set([...Object.keys(previous.get(key)), ...Object.keys(next.get(key))])].sort(byField).filter(field => stable(previous.get(key)[field]) !== stable(next.get(key)[field]));
      return fields.length ? [{ id, fields }] : [];
    }),
  };
}
