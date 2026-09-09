import { readJson } from './catalog.mjs';
import { normalizeQuery, queryReport } from './query.mjs';

export function requireArgs(args, count, usage) {
  if (args.length !== count) throw new Error(`Usage: node cli.mjs ${usage}`);
}
export function inventoryDiff(catalog, inventory) {
  if (!inventory || inventory.owner !== 'EauDoon' || !Array.isArray(inventory.repositories) || inventory.repositories.length > 1000 || Object.keys(inventory).sort().join(',') !== 'owner,repositories') throw new Error('Expected a public-only inventory with owner and repositories');
  const names = new Set();
  for (const row of inventory.repositories) {
    if (!row || Object.keys(row).sort().join(',') !== 'id,public' || row.public !== true || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(row.id) || names.has(row.id.toLowerCase())) throw new Error('Inventory rows must be unique public repository ids');
    names.add(row.id.toLowerCase());
  }
  const catalogIds = new Set(catalog.projects.map(p => p.id.toLowerCase()));
  return {
    note: 'Comparison with a supplied public-only snapshot; no network lookup or reason for absence is inferred.',
    absentFromSnapshot: catalog.projects.filter(p => !names.has(p.id.toLowerCase())).map(p => p.id).sort(),
    unassessed: inventory.repositories.filter(p => !catalogIds.has(p.id.toLowerCase())).map(p => p.id).sort(),
    matched: catalog.projects.filter(p => names.has(p.id.toLowerCase())).length,
  };
}
export const workflows = {
  query(catalog, args) {
    requireArgs(args, 1, 'query QUERY.json');
    return queryReport(catalog, normalizeQuery(readJson(args[0]), catalog));
  },
  inventory(catalog, args) {
    requireArgs(args, 1, 'inventory PUBLIC-INVENTORY.json');
    return inventoryDiff(catalog, readJson(args[0]));
  },
};
