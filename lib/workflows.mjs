import { readJson } from './catalog.mjs';
import { normalizeQuery, queryReport, facets } from './query.mjs';
import { pageResults } from './page.mjs';
import { coveragePlan } from './plan.mjs';
import { renderSelection, writeNewOutput } from './export.mjs';
import { catalogReceipt, verifyReceipt } from './identity.mjs';

export function requireArgs(args, count, usage) {
  if (args.length !== count) throw new Error(`Usage: node cli.mjs ${usage}`);
}
export function inventoryDiff(catalog, inventory) {
  if (!inventory || inventory.owner !== 'EauDoon' || !Array.isArray(inventory.repositories) || inventory.repositories.length > 1000 || Object.keys(inventory).sort().join(',') !== 'owner,repositories') throw new Error('Expected a public-only inventory with owner and repositories');
  const names = new Set();
  for (const row of inventory.repositories) {
    if (!row || Object.keys(row).sort().join(',') !== 'id,public' || row.public !== true || typeof row.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(row.id) || names.has(row.id.toLowerCase())) throw new Error('Inventory rows must be unique public repository ids');
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
  receipt(catalog, args) {
    requireArgs(args, 0, 'receipt');
    return catalogReceipt(catalog);
  },
  'verify-receipt'(catalog, args) {
    if (args.length < 1 || args.length > 2) throw new Error('Usage: node cli.mjs verify-receipt RECEIPT.json [EXPECTED-DIGEST]');
    return verifyReceipt(catalog, readJson(args[0]), args[1]);
  },
  export(catalog, args) {
    requireArgs(args, 3, 'export QUERY.json FORMAT NEW-OUTPUT');
    const query = normalizeQuery(readJson(args[0]), catalog);
    const content = renderSelection(catalog, query, args[1]);
    return { status: 'written', format: args[1], ...writeNewOutput(args[2], content) };
  },
  plan(catalog, args) {
    requireArgs(args, 3, 'plan QUERY.json TASKS.json MAX-PROJECTS');
    if (!/^[1-4]$/.test(args[2])) throw new Error('Maximum projects must be from 1 to 4');
    return coveragePlan(catalog, normalizeQuery(readJson(args[0]), catalog), readJson(args[1]), Number(args[2]));
  },
  page(catalog, args) {
    if (args.length < 2 || args.length > 3 || !/^[1-9][0-9]{0,2}$/.test(args[1])) throw new Error('Usage: node cli.mjs page QUERY.json SIZE [CURSOR]');
    return pageResults(catalog, normalizeQuery(readJson(args[0]), catalog), Number(args[1]), args[2]);
  },
  facets(catalog, args) {
    requireArgs(args, 1, 'facets QUERY.json');
    return facets(catalog, normalizeQuery(readJson(args[0]), catalog));
  },
  query(catalog, args) {
    requireArgs(args, 1, 'query QUERY.json');
    return queryReport(catalog, normalizeQuery(readJson(args[0]), catalog));
  },
  inventory(catalog, args) {
    requireArgs(args, 1, 'inventory PUBLIC-INVENTORY.json');
    return inventoryDiff(catalog, readJson(args[0]));
  },
};
