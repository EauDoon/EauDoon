import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadCatalog, errorMessage, validDate } from '../lib/catalog.mjs';

// The reference date is the UTC calendar date unless --today pins it.
const today = () => new Date().toISOString().slice(0, 10);
const dayMs = 86400000;

function isPositiveWave(n) {
  return Number.isInteger(n) && n >= 1 && n <= 99;
}

function summarize(catalog) {
  const waveCount = {};
  for (const p of catalog.projects) {
    if (!Array.isArray(p.wavesTouched)) continue;
    for (const w of p.wavesTouched) {
      if (!isPositiveWave(w)) continue;
      waveCount[w] = (waveCount[w] ?? 0) + 1;
    }
  }
  const topLevel = [...(catalog.portfolioWavesCompleted ?? [])]
    .filter(isPositiveWave)
    .sort((a, b) => a - b);
  return { waveCount, topLevel };
}

export function detectDrift(catalog, options = {}) {
  const maxAgeDays = options.maxAgeDays === undefined ? 45 : options.maxAgeDays;
  // 0, fractions, and unsafe magnitudes used to become the 45-day default, so a
  // catalog younger than 45 days was reported as fresh. 1e21 is an integer in
  // IEEE-754 and made the age check impossible to fail.
  if (!Number.isSafeInteger(maxAgeDays) || maxAgeDays <= 0 || maxAgeDays > 36500) throw new Error('--max-age-days must be a positive integer up to 36500');
  const referenceDate = options.today === undefined ? today() : options.today;
  // Date.parse('2026-02-31') overflows to March instead of failing, and a
  // non-date makes the age comparison NaN. Either path used to exit 0.
  if (!validDate(referenceDate)) throw new Error('--today must be a real YYYY-MM-DD date');
  const issues = [];

  if (!Array.isArray(catalog.projects) || catalog.projects.length === 0) {
    issues.push('catalog has no projects to check');
    return { issues, summary: { projects: 0, topLevel: [], perWaveCounts: {} }, referenceDate };
  }

  const { waveCount, topLevel } = summarize(catalog);
  const topLevelSet = new Set(topLevel);
  const perWaveCounts = Object.fromEntries(Object.entries(waveCount).map(([k, v]) => [Number(k), v]));

  const sortedWaves = Object.keys(perWaveCounts).map(Number).filter(isPositiveWave).sort((a, b) => a - b);
  for (const w of sortedWaves) {
    if (!topLevelSet.has(w)) {
      issues.push(`wave ${w} appears in ${perWaveCounts[w]} project(s) but is missing from portfolioWavesCompleted`);
    }
  }

  let projectsWithAudit = 0;
  let projectsWithWave = 0;
  let newestLastAudited = null;
  for (const p of catalog.projects) {
    if (Array.isArray(p.wavesTouched) && p.wavesTouched.length > 0) projectsWithWave += 1;
    // A shape-only check counted 2026-02-31 as an audit and treated the string
    // "9999" as newer than assessedOn because it sorts later.
    if (validDate(p.lastAudited)) {
      projectsWithAudit += 1;
      if (newestLastAudited === null || p.lastAudited > newestLastAudited) newestLastAudited = p.lastAudited;
      if (typeof catalog.assessedOn === 'string' && p.lastAudited > catalog.assessedOn) {
        issues.push(`${p.id}: lastAudited ${p.lastAudited} is newer than catalog.assessedOn ${catalog.assessedOn}`);
      }
    }
  }

  if (typeof catalog.assessedOn === 'string') {
    const ageDays = Math.floor((Date.parse(referenceDate) - Date.parse(catalog.assessedOn)) / dayMs);
    if (ageDays < 0) {
      issues.push(`catalog.assessedOn ${catalog.assessedOn} is later than referenceDate ${referenceDate}`);
    } else if (ageDays > maxAgeDays) {
      issues.push(`catalog.assessedOn ${catalog.assessedOn} is ${ageDays} days old (limit ${maxAgeDays}); refresh required`);
    }
  }

  const projectIds = new Set();
  const duplicateIds = [];
  for (const p of catalog.projects) {
    if (typeof p.id !== 'string' || !p.id) continue;
    // Catalog identity is case-insensitive: EauDoon and eaudoon are one project.
    const key = p.id.toLowerCase();
    if (projectIds.has(key)) duplicateIds.push(p.id);
    projectIds.add(key);
  }
  for (const id of duplicateIds) issues.push(`duplicate project id: ${id}`);

  return {
    issues,
    summary: {
      projects: catalog.projects.length,
      projectsWithAudit,
      projectsWithWave,
      topLevel,
      perWaveCounts,
      newestLastAudited,
    },
    referenceDate,
  };
}

const usage = 'Usage: node scripts/drift.mjs [--check|--json] [--max-age-days N] [--today YYYY-MM-DD]';
const valueOptions = ['--max-age-days', '--today'];

// A usage error exits 2 with the usage line. Its message names only an option
// from the fixed list above: an unknown argument is never echoed, so terminal
// escapes in argv cannot reach stderr.
class UsageError extends Error {}

// The mode is optional, as the usage line says, and comes first when given.
// Each option takes one value and may appear once. A following token that
// starts with -- is a missing value, not a value.
function parseArgs(args) {
  if (args.includes('--help')) return { help: true };
  const mode = args[0] === '--check' || args[0] === '--json' ? args[0] : '--check';
  const options = {};
  for (let i = mode === args[0] ? 1 : 0; i < args.length; i += 1) {
    const name = valueOptions.find(option => option === args[i]);
    if (!name) throw new UsageError('Unknown argument');
    if (Object.hasOwn(options, name)) throw new UsageError(`Repeated option ${name}`);
    const value = args[i + 1];
    if (value === undefined || value.startsWith('--')) throw new UsageError(`Missing value for ${name}`);
    options[name] = value;
    i += 1;
  }
  let maxAgeDays = 45;
  if (options['--max-age-days'] !== undefined) {
    const raw = options['--max-age-days'];
    // Number('45.0'), Number('0x2d'), and Number('1e2') are integers. Freshness
    // already requires a plain decimal; the same spellings must not widen drift.
    if (!/^[1-9][0-9]{0,4}$/.test(raw)) throw new Error('--max-age-days must be a positive integer up to 36500');
    maxAgeDays = Number(raw);
    if (maxAgeDays > 36500) throw new Error('--max-age-days must be a positive integer up to 36500');
  }
  return { mode, maxAgeDays, today: options['--today'] };
}

function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(`drift: ${error.message}`);
    console.error(usage);
    process.exitCode = 2;
    return;
  }
  if (parsed.help) {
    console.log(usage);
    return;
  }
  const { mode, maxAgeDays, today: todayOverride } = parsed;
  const catalog = loadCatalog();
  const result = detectDrift(catalog, { maxAgeDays, today: todayOverride });
  if (mode === '--json') {
    console.log(JSON.stringify({ assessedOn: catalog.assessedOn, ...result }, null, 2));
    process.exitCode = result.issues.length ? 1 : 0;
    return;
  }
  const unaudited = catalog.projects.filter(p => !p.lastAudited).map(p => p.id);
  console.log(`catalog drift: assessedOn=${catalog.assessedOn}, referenceDate=${result.referenceDate}, projects=${result.summary.projects}, audited=${result.summary.projectsWithAudit}/${result.summary.projects}, topLevel=[${result.summary.topLevel.join(',')}]`);
  if (unaudited.length) console.log(`no lastAudited date recorded for: ${unaudited.join(', ')}.`);
  if (result.issues.length === 0) {
    console.log('no drift detected.');
    return;
  }
  for (const issue of result.issues) console.log(`- ${issue}`);
  process.exitCode = 1;
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

// Importing detectDrift must not parse argv or print a report. The test runner
// loads this module, and a stale catalog would otherwise fail that process.
if (invokedAsCli()) {
  try { main(); } catch (error) {
    console.error(`drift: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}
