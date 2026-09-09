const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : 1)) : v);
export function diffSnapshots(before, after) {
  const previous = new Map(before.projects.map(p => [p.id, p]));
  const next = new Map(after.projects.map(p => [p.id, p]));
  return {
    beforeDate: before.assessedOn, afterDate: after.assessedOn,
    metadataChanged: ['assessedOn', 'assessment'].filter(key => before[key] !== after[key]),
    added: [...next.keys()].filter(id => !previous.has(id)).sort(),
    removed: [...previous.keys()].filter(id => !next.has(id)).sort(),
    changed: [...next.keys()].filter(id => previous.has(id)).sort().flatMap(id => {
      const fields = Object.keys(next.get(id)).filter(key => stable(previous.get(id)[key]) !== stable(next.get(id)[key]));
      return fields.length ? [{ id, fields }] : [];
    }),
  };
}
