// encoding: utf-8, LF, no BOM
// Hints for search words that find nothing or name a filter value. Matching
// itself is unchanged: hints only suggest, and every count comes from running
// the same exact search with one change applied.
import { vocab } from './catalog.mjs';
import { search, filterProjects } from './discover.mjs';
import { runQuery } from './query.mjs';

// Only plain words are echoed back, so control, format and bidirectional
// characters never reach the output. Any other word gets no hint.
export const echoable = word => /^[\p{L}\p{N}.+-]{1,40}$/u.test(word);
const maximumWords = 20;
const maximumSuggestions = 3;
const searchText = p => [p.id, p.summary, p.category, ...p.tasks].join(' ').toLowerCase();
const byText = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// The words search compares, lowercased and de-duplicated in typed order.
// Every one of them takes part in each count.
export function allWords(text) {
  return [...new Set(text.toLowerCase().trim().split(/\s+/).filter(Boolean))];
}

// The words that can get a hint: the first 20 distinct words.
export function words(text) {
  return allWords(text).slice(0, maximumWords);
}

// Catalog terms from the fields search reads. Hyphenated ids and tags are kept
// whole and as their parts; sentence punctuation is trimmed; short terms are
// dropped because they would match almost anything.
export function terms(projects) {
  const found = new Set();
  for (const project of projects) {
    for (const raw of searchText(project).split(/[^\p{L}\p{N}.-]+/u)) {
      const token = raw.replace(/^[.-]+|[.-]+$/g, '');
      for (const term of [token, ...token.split('-')]) if (term.length >= 3) found.add(term);
    }
  }
  return [...found].sort(byText);
}

// Edit distance where an insertion, deletion, substitution or swap of two
// adjacent characters each costs 1 (optimal string alignment), or Infinity
// above the limit. Inputs are at most 40 characters, so the full table is cheap.
export function distance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return Infinity;
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length] <= limit ? d[a.length][b.length] : Infinity;
}

// Up to three close terms for a word that no eligible project contains. Words
// under four characters get none; the allowed distance is 1 up to five
// characters and 2 from six. count(term) is the result count with the word
// replaced by the term, and a term that would still find nothing is dropped.
export function spellingSuggestions(word, eligible, count) {
  if (word.length < 4 || eligible.some(p => searchText(p).includes(word))) return [];
  const limit = word.length <= 5 ? 1 : 2;
  return terms(eligible)
    .map(term => ({ term, distance: distance(word, term, limit) }))
    .filter(row => row.distance !== Infinity)
    .map(row => ({ ...row, matches: count(row.term) }))
    .filter(row => row.matches >= 1)
    .sort((a, b) => a.distance - b.distance || byText(a.term, b.term))
    .slice(0, maximumSuggestions)
    .map(({ term, matches }) => ({ term, matches }));
}

// The filter values a word can name, in the order the CLI help lists them.
const filterChoices = projects => ({ category: vocab.category, runtime: vocab.runtimes, privacy: vocab.privacy, task: [...new Set(projects.flatMap(p => p.tasks))].sort(byText) });
const namesValue = (choices, word) => Object.values(choices).some(values => values.includes(word));

// Hints for an interactive search: projects is the whole catalog, options the
// parsed filters. A word equal to a filter value whose option was not
// supplied gets a filter hint counted with the word replaced by that filter,
// shown only when it would change the result count. command says how to
// follow it: search with the other words, or list when no other word is
// left, because search needs at least one word.
export function searchHints(projects, text, options) {
  const all = allWords(text);
  const eligible = filterProjects(projects, options);
  const current = search(eligible, text).length;
  const choices = filterChoices(projects);
  const hints = [];
  for (const word of words(text).filter(echoable)) {
    // A word that names a filter value was not misspelt: it gets no spelling hint.
    const suggestions = namesValue(choices, word) ? [] : spellingSuggestions(word, eligible, term => search(eligible, all.map(w => w === word ? term : w).join(' ')).length);
    if (suggestions.length) hints.push({ word, kind: 'spelling', suggestions });
    const rest = all.filter(w => w !== word).join(' ');
    for (const [option, values] of Object.entries(choices)) {
      if (Object.hasOwn(options, option) || !values.includes(word)) continue;
      const matches = search(filterProjects(projects, { ...options, [option]: word }), rest).length;
      if (matches >= 1 && matches !== current) hints.push({ word, kind: 'filter', option, value: word, command: rest ? 'search' : 'list', matches });
    }
  }
  return hints;
}

// Spelling suggestions for a saved query's text. The vocabulary comes from the
// projects its filters and exclusions allow, and each count reruns the whole
// query with the one word replaced.
export function textSuggestions(catalog, query) {
  const all = allWords(query.text);
  const eligible = runQuery(catalog, { ...query, text: '' });
  const choices = filterChoices(catalog.projects);
  return words(query.text).filter(echoable).filter(word => !namesValue(choices, word)).flatMap(word => {
    const suggestions = spellingSuggestions(word, eligible, term => runQuery(catalog, { ...query, text: all.map(w => w === word ? term : w).join(' ') }).length);
    return suggestions.length ? [{ word, kind: 'spelling', suggestions }] : [];
  });
}

const counted = (count, one, many) => `${count} ${count === 1 ? one : many}`;
const listed = items => items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;

// A filter hint as it is followed. With other words left, the word is
// replaced by the filter. Otherwise it is a list command carrying the filters
// already supplied, in the help's option order; their values passed option
// validation, so they are plain catalog values.
const filterOrder = ['category', 'runtime', 'privacy', 'task', 'fork'];
function filterAdvice(hint, options) {
  if (hint.command === 'search') return `replacing the word with --${hint.option} ${hint.value}`;
  const filters = { ...options, [hint.option]: hint.value };
  return ['list', ...filterOrder.filter(key => Object.hasOwn(filters, key)).map(key => `--${key} ${filters[key]}`)].join(' ');
}

// The human hints block: a blank line, a heading and one line per hint, or an
// empty string when there are none. options are the filters the search used.
export function renderHints(hints, options = {}) {
  if (!hints.length) return '';
  return ['', '', 'Hints (results are unchanged):', ...hints.map(hint => hint.kind === 'spelling'
    ? `  ${hint.word}: did you mean ${listed(hint.suggestions.map(s => `${s.term} (${counted(s.matches, 'match', 'matches')})`))}?`
    : `  ${hint.word}: ${filterAdvice(hint, options)} matches ${counted(hint.matches, 'project', 'projects')}`)].join('\n');
}
