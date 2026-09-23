import { loadCatalog, errorMessage } from '../lib/catalog.mjs';

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
  const maxAgeDays = Number.isInteger(options.maxAgeDays) && options.maxAgeDays > 0 ? options.maxAgeDays : 45;
  const referenceDate = typeof options.today === 'string' ? options.today : today();
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
    if (typeof p.lastAudited === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.lastAudited)) {
      projectsWithAudit += 1;
      if (newestLastAudited === null || p.lastAudited > newestLastAudited) newestLastAudited = p.lastAudited;
    }
    if (typeof p.lastAudited === 'string' && p.lastAudited > catalog.assessedOn) {
      issues.push(`${p.id}: lastAudited ${p.lastAudited} is newer than catalog.assessedOn ${catalog.assessedOn}`);
    }
  }

  if (typeof catalog.assessedOn === 'string' && referenceDate >= catalog.assessedOn) {
    const ageDays = Math.floor((Date.parse(referenceDate) - Date.parse(catalog.assessedOn)) / dayMs);
    if (ageDays > maxAgeDays) {
      issues.push(`catalog.assessedOn ${catalog.assessedOn} is ${ageDays} days old (limit ${maxAgeDays}); refresh required`);
    }
  }

  const projectIds = new Set();
  const duplicateIds = [];
  for (const p of catalog.projects) {
    if (!p.id) continue;
    if (projectIds.has(p.id)) duplicateIds.push(p.id);
    projectIds.add(p.id);
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

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) args.push('--check');
  const mode = args[0];
  if (!['--check', '--json'].includes(mode)) {
    console.error('Usage: node scripts/drift.mjs [--check|--json] [--max-age-days N] [--today YYYY-MM-DD]');
    process.exitCode = 2;
    return;
  }
  let maxAgeDays = 45;
  let todayOverride;
  for (let i = 1; i < args.length; i += 1) {
    if (args[i] === '--max-age-days' && args[i + 1]) {
      const n = Number(args[i + 1]);
      if (!Number.isInteger(n) || n <= 0) throw new Error('--max-age-days must be a positive integer');
      maxAgeDays = n; i += 1;
    } else if (args[i] === '--today' && args[i + 1]) {
      todayOverride = args[i + 1]; i += 1;
    } else {
      throw new Error(`Unknown argument: ${args[i]}`);
    }
  }
  const catalog = loadCatalog();
  const result = detectDrift(catalog, { maxAgeDays, today: todayOverride });
  if (mode === '--json') {
    console.log(JSON.stringify({ assessedOn: catalog.assessedOn, ...result }, null, 2));
    process.exitCode = result.issues.length ? 1 : 0;
    return;
  }
  console.log(`catalog drift: assessedOn=${catalog.assessedOn}, referenceDate=${result.referenceDate}, projects=${result.summary.projects}, topLevel=[${result.summary.topLevel.join(',')}]`);
  if (result.issues.length === 0) {
    console.log('no drift detected.');
    return;
  }
  for (const issue of result.issues) console.log(`- ${issue}`);
  process.exitCode = 1;
}

try { main(); } catch (error) {
  console.error(`drift: ${errorMessage(error)}`);
  process.exitCode = 1;
}
