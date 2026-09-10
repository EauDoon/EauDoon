const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : 1)) : v);
export function diffSnapshots(before, after) {
  const previous = new Map(before.projects.map(p => [p.id.toLowerCase(), p]));
  const next = new Map(after.projects.map(p => [p.id.toLowerCase(), p]));
  return {
    beforeDate: before.assessedOn, afterDate: after.assessedOn,
    metadataChanged: ['assessedOn', 'assessment'].filter(key => before[key] !== after[key]),
    added: [...next.keys()].filter(id => !previous.has(id)).map(id => next.get(id).id).sort(),
    removed: [...previous.keys()].filter(id => !next.has(id)).map(id => previous.get(id).id).sort(),
    changed: after.projects.filter(p => previous.has(p.id.toLowerCase())).map(p => p.id).sort().flatMap(id => {
      const key = id.toLowerCase();
      const fields = Object.keys(next.get(key)).filter(field => stable(previous.get(key)[field]) !== stable(next.get(key)[field]));
      return fields.length ? [{ id, fields }] : [];
    }),
  };
}
