import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadCatalog, readJson, validDate, errorMessage } from '../lib/catalog.mjs';
import { inventoryDiff } from '../lib/workflows.mjs';

export function checkInventory(catalog, snapshot, today = new Date().toISOString().slice(0, 10)) {
  const exact = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join(',') === keys;
  if (!exact(snapshot, 'complete,exclusions,owner,repositories,retrievedOn,source')
    || snapshot.owner !== 'EauDoon' || snapshot.complete !== true
    || snapshot.source !== 'https://api.github.com/search/repositories?q=user%3AEauDoon%20is%3Apublic%20fork%3Afalse'
    || !validDate(snapshot.retrievedOn) || !validDate(today)
    || !Array.isArray(snapshot.repositories) || !snapshot.repositories.length
    || !Array.isArray(snapshot.exclusions) || snapshot.exclusions.length > 1000) {
    throw new Error('Expected a complete dated public owner inventory and explicit exclusions');
  }
  for (const row of snapshot.repositories) {
    if (!exact(row, 'archived,fork,id,public') || row.public !== true || row.fork !== false || typeof row.archived !== 'boolean') {
      throw new Error('Inventory must contain only explicit public non-fork records');
    }
  }
  const owned = { ...catalog, projects: catalog.projects.filter(project => !project.fork) };
  const compared = inventoryDiff(owned, { owner: snapshot.owner,
    repositories: snapshot.repositories.map(({ id, public: isPublic }) => ({ id, public: isPublic })) });
  const ids = new Set(snapshot.repositories.map(row => row.id.toLowerCase()));
  const excluded = new Set();
  for (const row of snapshot.exclusions) {
    if (!exact(row, 'id,reason') || typeof row.id !== 'string' || !ids.has(row.id.toLowerCase())
      || excluded.has(row.id.toLowerCase()) || typeof row.reason !== 'string' || !row.reason.trim()
      || row.reason.length > 500 || /[\p{Cc}\p{Cf}<>]/u.test(row.reason)) {
      throw new Error('Exclusions must name unique inventory entries with a public reason');
    }
    excluded.add(row.id.toLowerCase());
  }
  const issues = [];
  const age = (Date.parse(today) - Date.parse(snapshot.retrievedOn)) / 86400000;
  if (age < 0 || age > 45) issues.push('Public inventory snapshot is future-dated or older than 45 days; refresh required');
  for (const id of compared.unassessed) if (!excluded.has(id.toLowerCase())) issues.push(`${id}: needs assessment or an explicit exclusion`);
  for (const id of compared.absentFromSnapshot) issues.push(`${id}: absent from the supplied public non-fork snapshot; review required`);
  for (const project of owned.projects) {
    if (project.id.toLowerCase() === snapshot.owner.toLowerCase()) issues.push('The profile is presentation infrastructure, not a project entry');
    if (excluded.has(project.id.toLowerCase())) issues.push(`${project.id}: cannot be both assessed and excluded`);
    if (snapshot.repositories.some(row => row.id.toLowerCase() === project.id.toLowerCase() && row.archived)) {
      issues.push(`${project.id}: archived in the snapshot; remove from the current assessed set`);
    }
  }
  return { issues, exclusions: snapshot.exclusions, retrievedOn: snapshot.retrievedOn,
    matched: compared.matched, note: 'Offline coverage of a supplied public snapshot, not a live GitHub or project-quality check.' };
}

function invokedAsCli() {
  try { return process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; }
  catch { return false; }
}

if (invokedAsCli()) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node scripts/inventory-check.mjs [PUBLIC-SNAPSHOT.json]');
    const result = checkInventory(loadCatalog(), readJson(process.argv[2] ?? new URL('../public-inventory.json', import.meta.url)));
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.issues.length ? 1 : 0;
  } catch (error) {
    console.error(`inventory: unknown: ${errorMessage(error)}`);
    process.exitCode = 1;
  }
}
