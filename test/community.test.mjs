import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const templates = new URL('../.github/ISSUE_TEMPLATE/', import.meta.url);
const read = (name, base = templates) => readFileSync(new URL(name, base), 'utf8').replace(/\r\n/g, '\n');

// GitHub lists a Markdown issue template only when it opens with YAML front
// matter that has a name and an about line; without it the file is ignored.
test('every Markdown issue template has the front matter GitHub requires', () => {
  const names = readdirSync(templates).filter(name => name.endsWith('.md'));
  assert.ok(names.length >= 2);
  for (const name of names) {
    const front = /^---\n([\s\S]*?)\n---\n/.exec(read(name))?.[1];
    assert.ok(front, `${name} has no YAML front matter`);
    for (const key of ['name', 'about']) assert.match(front, new RegExp(`^${key}: \\S`, 'm'), `${name} front matter needs ${key}`);
  }
});

test('the issue chooser routes security reports to the private policy', () => {
  const config = read('config.yml');
  assert.match(config, /^blank_issues_enabled: true$/m);
  assert.match(config, /url: https:\/\/github\.com\/EauDoon\/EauDoon\/security\/policy$/m);
  const policy = read('SECURITY.md', new URL('../', import.meta.url));
  assert.match(policy, /https:\/\/github\.com\/EauDoon\/EauDoon\/security\/advisories\/new/);
  assert.match(policy, /Security contact request/);
  assert.match(policy, /node cli\.mjs --version/);
});
