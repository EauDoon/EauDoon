import { loadCatalog } from './lib/catalog.mjs';

try {
  if (process.argv.slice(2).join(' ') !== 'validate') throw new Error('Usage: node cli.mjs validate');
  const catalog = loadCatalog();
  console.log(`Valid catalog: ${catalog.projects.length} public projects`);
} catch (error) {
  console.error(`catalog: ${error.message}`);
  process.exitCode = 1;
}
