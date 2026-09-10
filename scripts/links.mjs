import { readFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkLinks } from '../lib/links.mjs';

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const files = ['README.md', 'docs/CATALOG.md', 'docs/DISCOVERY.md', 'docs/WORKFLOWS.md'];
const errors = files.flatMap(name => {
  const file = fileURLToPath(new URL(`../${name}`, import.meta.url));
  return checkLinks(readFileSync(file, 'utf8'), file, root).map(e => `${name}: ${e}`);
});
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Local link targets and external URL syntax pass. Remote availability and anchors were not checked.');
