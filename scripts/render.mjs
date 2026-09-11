import { readFileSync, writeFileSync } from 'node:fs';
import { loadCatalog, errorMessage } from '../lib/catalog.mjs';
import { renderCatalog } from '../lib/render.mjs';

try {
  const mode = process.argv.slice(2).join(' ');
  if (!['--check', '--write'].includes(mode)) throw new Error('Usage: node scripts/render.mjs --check|--write');
  const target = new URL('../docs/CATALOG.md', import.meta.url);
  const output = renderCatalog(loadCatalog());
  if (mode === '--write') writeFileSync(target, output);
  else if (readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== output) throw new Error('Catalog guide is stale. Run node scripts/render.mjs --write and review the diff.');
  console.log(mode === '--write' ? 'Catalog guide generated' : 'Catalog guide is current');
} catch (error) { console.error(errorMessage(error)); process.exitCode = 1; }
