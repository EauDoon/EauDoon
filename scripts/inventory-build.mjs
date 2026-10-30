import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadCatalog, readJson, validDate, errorMessage } from '../lib/catalog.mjs';
import { writeNewOutput } from '../lib/export.mjs';
import { checkInventory } from './inventory-check.mjs';

const owner = 'EauDoon';
// inventory-check requires exactly this source, the query the pages answer.
const source = 'https://api.github.com/search/repositories?q=user%3AEauDoon%20is%3Apublic%20fork%3Afalse';
const usage = 'Usage: node scripts/inventory-build.mjs [--base SNAPSHOT.json] [--retrieved-on YYYY-MM-DD] --output NEW-SNAPSHOT.json PAGE.json [PAGE.json ...]';
// GitHub search returns at most 1000 results, which is 34 pages at the
// default page size; one file per page at per_page=100 needs only 10.
const maximumPages = 100;
const maximumResults = 1000;

export class UsageError extends Error {}

const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const byId = (a, b) => {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

// Flags take one value each and appear at most once; every other argument is
// a page file. Usage errors never echo the arguments.
export function parseArgs(args) {
  const flags = { '--base': 'base', '--retrieved-on': 'retrievedOn', '--output': 'output' };
  const options = { pages: [] };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('-')) {
      if (!Object.hasOwn(flags, arg) || Object.hasOwn(options, flags[arg])) throw new UsageError(usage);
      const value = args[i + 1];
      if (value === undefined || value.startsWith('-')) throw new UsageError(usage);
      options[flags[arg]] = value;
      i += 1;
    } else {
      options.pages.push(arg);
    }
  }
  if (!options.pages.length || options.output === undefined) throw new UsageError(usage);
  return options;
}

// Saved search responses: one response object per file, or an array of them
// as written by gh api --paginate --slurp.
export function flattenPages(files) {
  const pages = files.flatMap(value => Array.isArray(value) ? value : [value]);
  if (!pages.length) throw new Error('No search pages were supplied');
  if (pages.length > maximumPages) throw new Error(`At most ${maximumPages} search pages are accepted; use per_page=100`);
  return pages;
}

// Turns complete public search results into a candidate snapshot in the
// checked-in format. Anything that leaves the result incomplete or ambiguous
// rejects the whole build: an error or partial result is unknown, never an
// empty or shortened successful inventory.
export function buildInventory(pages, base, retrievedOn) {
  if (!validDate(retrievedOn)) throw new Error('The retrieval date must be a valid YYYY-MM-DD calendar date');
  if (!Array.isArray(pages) || !pages.length || pages.length > maximumPages) throw new Error(`Expected 1 to ${maximumPages} search pages`);
  let totalCount;
  const found = new Map();
  for (const page of pages) {
    if (!plain(page) || !Array.isArray(page.items)) throw new Error('Each page must be a repository search response with items');
    if (page.incomplete_results !== false) throw new Error('A page did not report incomplete_results: false; the inventory is unknown');
    if (!Number.isInteger(page.total_count) || page.total_count < 0) throw new Error('A page has no integer total_count');
    if (totalCount !== undefined && page.total_count !== totalCount) throw new Error('Pages disagree on total_count; retrieve every page again');
    totalCount = page.total_count;
    for (const item of page.items) {
      if (!plain(item) || typeof item.name !== 'string' || item.full_name !== `${owner}/${item.name}` || !plain(item.owner) || item.owner.login !== owner) {
        throw new Error(`Every item must be a repository owned by ${owner}`);
      }
      // The id format the catalog and the coverage check accept.
      if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(item.name)) throw new Error('A repository name is outside the supported id format');
      if (item.private !== false || (Object.hasOwn(item, 'visibility') && item.visibility !== 'public')) throw new Error('Every item must be explicitly public');
      if (item.fork !== false) throw new Error('Every item must be explicitly not a fork');
      if (typeof item.archived !== 'boolean') throw new Error('Every item must state whether it is archived');
      const key = item.name.toLowerCase();
      const seen = found.get(key);
      if (seen && (seen.id !== item.name || seen.archived !== item.archived)) throw new Error('A repository appears twice with different details');
      found.set(key, { id: item.name, public: true, fork: false, archived: item.archived });
    }
  }
  if (totalCount === 0) throw new Error('The search returned no repositories; an empty inventory is unknown');
  if (totalCount > maximumResults) throw new Error(`total_count exceeds ${maximumResults}, which the search cannot return in full; the inventory is unknown`);
  if (found.size !== totalCount) throw new Error(`The pages hold ${found.size} distinct repositories but total_count is ${totalCount}; retrieve every page`);

  const repositories = [...found.values()].sort((a, b) => byId(a.id, b.id));
  const returned = new Set(found.keys());
  const exclusions = base.exclusions.filter(row => returned.has(row.id.toLowerCase()));
  const candidate = { owner, retrievedOn, source, complete: true, repositories, exclusions };
  // A private entry is carried even if its id is now public, so the coverage
  // check flags it instead of the builder silently dropping the reason.
  if (Object.hasOwn(base, 'privateEntries')) candidate.privateEntries = base.privateEntries;
  const previous = new Map(base.repositories.map(row => [row.id.toLowerCase(), row]));
  return {
    candidate,
    totalCount,
    added: repositories.filter(row => !previous.has(row.id.toLowerCase())).map(row => row.id),
    removed: base.repositories.filter(row => !returned.has(row.id.toLowerCase())).map(row => row.id).sort(byId),
    archivedChanged: repositories.filter(row => previous.has(row.id.toLowerCase()) && previous.get(row.id.toLowerCase()).archived !== row.archived).map(row => row.id),
    droppedExclusions: base.exclusions.filter(row => !returned.has(row.id.toLowerCase())).map(row => row.id),
    carriedPrivateEntries: (candidate.privateEntries ?? []).map(row => row.id),
  };
}

export const serialize = snapshot => `${JSON.stringify(snapshot, null, 2)}\n`;

function main() {
  const options = parseArgs(process.argv.slice(2));
  const today = new Date().toISOString().slice(0, 10);
  const retrievedOn = options.retrievedOn ?? today;
  if (!validDate(retrievedOn)) throw new Error('--retrieved-on must be a valid YYYY-MM-DD calendar date');
  const catalog = loadCatalog();
  const base = readJson(options.base ?? new URL('../public-inventory.json', import.meta.url));
  // The base must itself be a valid snapshot; its own age is not at issue here.
  checkInventory(catalog, base, base.retrievedOn);
  const built = buildInventory(flattenPages(options.pages.map(page => readJson(page))), base, retrievedOn);
  const content = serialize(built.candidate);
  const { candidate, ...review } = built;
  const { issues } = checkInventory(catalog, candidate, today);
  const { bytes } = writeNewOutput(options.output, content);
  console.log(JSON.stringify({ status: 'written', bytes, retrievedOn, ...review, issues,
    note: 'Candidate only: review it, then copy it over public-inventory.json yourself. No network call was made and no catalog entry or pin was changed.' }, null, 2));
  process.exitCode = issues.length ? 1 : 0;
}

function invokedAsCli() {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

// Importing buildInventory must not read files or print anything.
if (invokedAsCli()) {
  try { main(); } catch (error) {
    console.error(`inventory-build: ${errorMessage(error)}`);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  }
}
