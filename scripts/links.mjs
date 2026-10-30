import { readFileSync, realpathSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkLinks, markdownFiles } from '../lib/links.mjs';

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const files = markdownFiles(root);
// One run reads each linked Markdown file's anchors once.
const anchors = new Map();
const errors = files.flatMap(file => checkLinks(readFileSync(file, 'utf8'), file, root, anchors).map(e => `${relative(root, file).split(sep).join('/')}: ${e}`));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Local link targets, Markdown heading anchors and external URL syntax pass in ${files.length} Markdown files. Remote availability was not checked.`);
