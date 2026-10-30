import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalog } from '../lib/catalog.mjs';
import { filterProjects, search } from '../lib/discover.mjs';
import { normalizeQuery } from '../lib/query.mjs';
import { diagnoseQuery } from '../lib/diagnose.mjs';
import { distance, echoable, renderHints, searchHints, spellingSuggestions, terms, textSuggestions, words } from '../lib/suggest.mjs';

const catalog = loadCatalog();
const hints = (text, options = {}) => searchHints(catalog.projects, text, options);
const spelling = (text, options) => hints(text, options).filter(hint => hint.kind === 'spelling');
const filters = (text, options) => hints(text, options).filter(hint => hint.kind === 'filter');

// Synthetic projects whose task and category counts differ from a text search.
const synthetic = ['alpha', 'beta', 'gamma'].map((id, i) => ({
  id: `synthetic-${id}`, summary: i === 0 ? 'Mentions fixture-task and publishing in prose.' : 'Plain synthetic entry.',
  category: i === 2 ? 'publishing' : 'discovery', runtimes: ['node'], privacy: 'public-content',
  tasks: i === 0 ? ['other-task'] : ['fixture-task'], boundary: 'Synthetic.', fork: false,
}));

test('a near miss or a typo gets the catalog term that finds a project', () => {
  for (const word of ['payments', 'paymnt', 'PAYMENTS']) {
    assert.deepEqual(spelling(word), [{ word: word.toLowerCase(), kind: 'spelling', suggestions: [{ term: 'payment', matches: 1 }] }], word);
    assert.deepEqual(search(catalog.projects, word), [], 'search results are unchanged');
  }
  assert.equal(search(catalog.projects, 'payment').length, 1);
  // An adjacent swap counts as one edit.
  assert.equal(distance('agnet', 'agent', 1), 1);
  assert.equal(distance('paymnt', 'payment', 2), 1);
  assert.equal(distance('abc', 'abcdef', 2), Infinity);
  assert.equal(distance('kitten', 'sitting', 2), Infinity);
  assert.equal(distance('kitten', 'sitting', 3), 3);
});

test('spelling hints follow the length rules, the match floor and the ordering', () => {
  assert.deepEqual(spelling('pay'), [], 'no hint under four characters');
  assert.deepEqual(spelling('payment'), [], 'a matching word gets no hint');
  assert.deepEqual(spelling('xqzvwk'), [], 'nothing close');
  // Distance 2 is allowed from six characters but not at five.
  const sized = [{ ...synthetic[1], id: 'abcdef', summary: 'Holds abcde.', tasks: ['plain'] }];
  assert.deepEqual(spellingSuggestions('abcdxx', sized, () => 1), [{ term: 'abcde', matches: 1 }, { term: 'abcdef', matches: 1 }]);
  assert.deepEqual(spellingSuggestions('abcxx', sized, () => 1), []);
  assert.deepEqual(spellingSuggestions('abcdx', sized, () => 1), [{ term: 'abcde', matches: 1 }]);
  const projects = ['abcd', 'abce', 'abcf', 'abcg', 'abxyz'].map(id => ({ ...synthetic[1], id, summary: 'Plain.', tasks: ['plain'] }));
  const counts = { abcd: 2, abce: 0, abcf: 1, abcg: 3 };
  const suggestions = spellingSuggestions('abch', projects, term => counts[term] ?? 0);
  assert.deepEqual(suggestions, [{ term: 'abcd', matches: 2 }, { term: 'abcf', matches: 1 }, { term: 'abcg', matches: 3 }]);
  assert.ok(suggestions.length <= 3 && suggestions.every(s => s.matches >= 1));
  // Counts keep the other words and filters, so a term that still finds
  // nothing alongside them is not suggested.
  assert.deepEqual(spelling('payments synthetic'), [{ word: 'payments', kind: 'spelling', suggestions: [{ term: 'payment', matches: 1 }] }]);
  assert.deepEqual(spelling('payments', { runtime: 'browser' }), []);
});

test('the vocabulary is the searched fields, split into whole and hyphenated terms', () => {
  const vocabulary = terms([{ ...synthetic[0], id: 'connect.md', summary: 'Builds a profile-page. Fast!', tasks: ['write-profile'] }]);
  for (const term of ['connect.md', 'profile-page', 'profile', 'page', 'builds', 'fast', 'write-profile', 'write', 'discovery']) assert.ok(vocabulary.includes(term), term);
  for (const term of ['a', 'profile-page.', 'fast!', 'node', 'public-content']) assert.ok(!vocabulary.includes(term), term);
  assert.deepEqual(words('  Payment   PAYMENT\tsynthetic '), ['payment', 'synthetic']);
  assert.equal(words(Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ')).length, 20);
});

test('a word naming a filter value suggests that filter when the count would change', () => {
  const python = filters('python');
  assert.deepEqual(python, [{ word: 'python', kind: 'filter', option: 'runtime', value: 'python', matches: filterProjects(catalog.projects, { runtime: 'python' }).length }]);
  assert.equal(python[0].matches, 10);
  assert.equal(search(catalog.projects, 'python').length, 1);
  assert.deepEqual(filters('local-after-setup'), [{ word: 'local-after-setup', kind: 'filter', option: 'privacy', value: 'local-after-setup', matches: 6 }]);
  assert.equal(filters('node')[0].matches, filterProjects(catalog.projects, { runtime: 'node' }).length);
  // A word that names a value is not treated as a typo.
  assert.deepEqual(spelling('node'), []);
  // Equal counts repeat what the user already sees, so they are not hinted.
  for (const word of ['replay-evidence', 'publishing']) assert.deepEqual(filters(word), [], word);
  // An option the user already supplied is never suggested again.
  assert.deepEqual(filters('python', { runtime: 'python' }), []);
  assert.deepEqual(filters('python', { runtime: 'node' }), []);
  assert.deepEqual(hints('synthetic payment'), []);
});

test('task and category values get filter hints when their counts differ', () => {
  const found = searchHints(synthetic, 'fixture-task publishing', {});
  assert.deepEqual(found.filter(hint => hint.kind === 'filter'), [
    { word: 'fixture-task', kind: 'filter', option: 'task', value: 'fixture-task', matches: 1 },
    { word: 'publishing', kind: 'filter', option: 'category', value: 'publishing', matches: 1 },
  ]);
  assert.equal(search(synthetic, 'fixture-task publishing').length, 2);
  assert.deepEqual(searchHints(synthetic, 'fixture-task', {}).map(({ option, matches }) => ({ option, matches })), [{ option: 'task', matches: 2 }]);
  assert.deepEqual(searchHints(synthetic, 'fixture-task', { task: 'other-task' }), []);
});

test('words with control, format or bidirectional characters are never echoed', () => {
  for (const word of ['pay\u001b[31ment', 'pay‮ment', 'pay​ment', 'x'.repeat(41), 'payment?']) {
    assert.equal(echoable(word), false, JSON.stringify(word));
    assert.deepEqual(hints(word), [], JSON.stringify(word));
  }
  assert.deepEqual(hints('pay\nments'), [], 'a newline splits words, and neither half gets a hint');
  for (const word of ['payments', 'connect.md', 'c++', 'zürich', '日本']) assert.equal(echoable(word), true, word);
});

test('the human hints block appends to unchanged results', () => {
  assert.equal(renderHints([]), '');
  assert.equal(renderHints([
    { word: 'paymnt', kind: 'spelling', suggestions: [{ term: 'payment', matches: 1 }] },
    { word: 'abch', kind: 'spelling', suggestions: [{ term: 'abcd', matches: 2 }, { term: 'abcf', matches: 1 }, { term: 'abcg', matches: 3 }] },
    { word: 'python', kind: 'filter', option: 'runtime', value: 'python', matches: 10 },
    { word: 'solo', kind: 'filter', option: 'task', value: 'solo', matches: 1 },
  ]), [
    '', '', 'Hints (results are unchanged):',
    '  paymnt: did you mean payment (1 match)?',
    '  abch: did you mean abcd (2 matches), abcf (1 match) or abcg (3 matches)?',
    '  python: --runtime python matches 10 projects',
    '  solo: --task solo matches 1 project',
  ].join('\n'));
});

test('diagnose adds text suggestions without changing any existing field', () => {
  const query = normalizeQuery({ version: 1, text: 'paymnt' }, catalog);
  const result = diagnoseQuery(catalog, query);
  assert.deepEqual(result.textSuggestions, [{ word: 'paymnt', kind: 'spelling', suggestions: [{ term: 'payment', matches: 1 }] }]);
  const { textSuggestions: _, ...rest } = result;
  // The fields 1.0.0 printed keep their documented values.
  assert.deepEqual(rest.matchingIds, []);
  assert.equal(rest.excludedCount, 0);
  assert.equal(rest.nearMissCount, catalog.projects.length);
  assert.deepEqual(rest.nearMisses.map(p => p.failedConstraints), catalog.projects.map(() => ['text']));
  assert.deepEqual(rest.singleConstraintRelaxations.map(({ omittedConstraint, matchCount, additionalProjects }) => [omittedConstraint, matchCount, additionalProjects.length]),
    [['text', catalog.projects.length, catalog.projects.length]]);
  assert.deepEqual(Object.keys(result), ['assessedOn', 'query', 'matchingIds', 'excludedCount', 'nearMissCount', 'nearMisses', 'singleConstraintRelaxations', 'textSuggestions', 'note']);
  // Exclusions and filters bound both the vocabulary and the counts.
  assert.deepEqual(textSuggestions(catalog, normalizeQuery({ version: 1, text: 'paymnt', exclude: ['operator-labs'] }, catalog)), []);
  assert.deepEqual(textSuggestions(catalog, normalizeQuery({ version: 1, text: 'paymnt', filters: { runtime: ['browser'] } }, catalog)), []);
  assert.deepEqual(textSuggestions(catalog, normalizeQuery({ version: 1, text: 'node paymnt', filters: {} }, catalog)), []);
  assert.deepEqual(diagnoseQuery(catalog, normalizeQuery({ version: 1 }, catalog)).textSuggestions, []);
});
