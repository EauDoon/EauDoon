import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { loadCatalog, readJson } from '../lib/catalog.mjs';

// The profile README and its constellation art are written by hand. These
// checks bind them to catalog.json, so a project added to or removed from the
// catalog cannot leave the most visible page stale or point it at a repository
// outside the reviewed public set.
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const catalog = loadCatalog();
const inventory = readJson(new URL('../public-inventory.json', import.meta.url));
const owned = catalog.projects.filter(p => p.fork === false);
const key = id => id.toLowerCase();

// GitHub repository names are case-insensitive; the first path segment names the repository.
const ownerLinks = text => [...text.matchAll(/https:\/\/github\.com\/EauDoon\/([^/\s"'<>()#?]+)/g)].map(match => match[1]);

const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven',
  'twenty-eight', 'twenty-nine', 'thirty'];
const countWord = text => {
  const match = /\b([a-z]+(?:-[a-z]+)?) public projects\b/i.exec(text);
  assert.ok(match, `no "<number> public projects" phrase in: ${text}`);
  const index = numberWords.indexOf(match[1].toLowerCase());
  assert.notEqual(index, -1, `"${match[1]}" is not a number word from one to thirty`);
  return index + 1;
};

test('every owned catalog project is linked from the README project index', () => {
  const linked = new Set(ownerLinks(readme).map(key));
  for (const project of owned) {
    assert.ok(linked.has(key(project.id)), `${project.id} is not linked from README.md; add it to the project index`);
  }
});

test('every EauDoon repository the README links to is catalogued or explicitly excluded', () => {
  const known = new Set([...catalog.projects.map(p => key(p.id)), ...inventory.exclusions.map(row => key(row.id))]);
  const links = ownerLinks(readme);
  assert.ok(links.length >= owned.length);
  for (const name of links) {
    assert.ok(known.has(key(name)), `README.md links EauDoon/${name}, which is not in catalog.json; catalog the project first`);
  }
});

test('the constellation states the number of owned projects', () => {
  const alt = /<img\b[^>]*\bsrc="assets\/constellation-light\.svg"[^>]*>/.exec(readme)?.[0];
  assert.ok(alt, 'README.md no longer shows the constellation');
  assert.equal(countWord(/\balt="([^"]*)"/.exec(alt)[1]), owned.length, 'README constellation alt text');
  const art = readdirSync(new URL('../assets/', import.meta.url)).filter(name => /^constellation-.*\.svg$/.test(name));
  assert.equal(art.length, 4);
  for (const name of art) {
    const svg = readFileSync(new URL(`../assets/${name}`, import.meta.url), 'utf8');
    assert.equal(countWord(/aria-label="([^"]*)"/.exec(svg)[1]), owned.length, `${name} aria-label`);
    assert.equal(countWord(/<title>([^<]*)<\/title>/.exec(svg)[1]), owned.length, `${name} <title>`);
  }
});

test('the fork contribution section links only catalogued forks', () => {
  const section = /^### Fork contribution\n([\s\S]*?)(?=^#{1,3} |^<\/details>)/m.exec(readme.replace(/\r\n/g, '\n'))?.[1];
  assert.ok(section, 'README.md has no "### Fork contribution" section');
  const forks = new Set(catalog.projects.filter(p => p.fork === true).map(p => key(p.id)));
  const links = ownerLinks(section);
  assert.ok(links.length, 'the fork contribution section links no EauDoon fork');
  for (const name of links) assert.ok(forks.has(key(name)), `${name} is linked as a fork contribution but is not a catalogued fork`);
});

test('the number-word table counts from one to thirty', () => {
  assert.equal(numberWords.length, 30);
  assert.equal(countWord('Thirteen public projects'), 13);
  assert.equal(countWord('a constellation of twenty-one public projects'), 21);
  assert.throws(() => countWord('many public projects'), /not a number word/);
  assert.throws(() => countWord('13 public projects'), /no "<number> public projects" phrase/);
});
