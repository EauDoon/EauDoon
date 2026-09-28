const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : 1)) : v);
export function diffSnapshots(before, after) {
  const previous = new Map(before.projects.map(p => [p.id.toLowerCase(), p]));
  const next = new Map(after.projects.map(p => [p.id.toLowerCase(), p]));
  const metadataKeys = ['schemaVersion', 'assessedOn', 'assessment', 'portfolioWavesCompleted'];
  return {
    beforeDate: before.assessedOn, afterDate: after.assessedOn,
    // Deep-compare: a cloned wave list is a new array, and key order is not a change.
    // Array order stays significant, matching the rest of the snapshot review.
    metadataChanged: metadataKeys.filter(key => stable(before[key]) !== stable(after[key])),
    added: [...next.keys()].filter(id => !previous.has(id)).map(id => next.get(id).id).sort(),
    removed: [...previous.keys()].filter(id => !next.has(id)).map(id => previous.get(id).id).sort(),
    changed: after.projects.filter(p => previous.has(p.id.toLowerCase())).map(p => p.id).sort().flatMap(id => {
      const key = id.toLowerCase();
      // Union the keys: a field dropped from the newer snapshot is a change too,
      // and a deleted source pin or boundary must not read as "no change".
      const fields = [...new Set([...Object.keys(previous.get(key)), ...Object.keys(next.get(key))])].filter(field => stable(previous.get(key)[field]) !== stable(next.get(key)[field]));
      return fields.length ? [{ id, fields }] : [];
    }),
  };
}
