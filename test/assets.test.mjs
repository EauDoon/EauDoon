import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The profile README renders every assets/*.svg on the public profile, through
// an img tag. These checks pin what a reader with a screen reader, a reduced
// motion setting or low vision gets from each artwork.
const dir = new URL('../assets/', import.meta.url);
const files = readdirSync(dir).filter(name => name.endsWith('.svg')).sort();
const read = name => readFileSync(new URL(name, dir), 'utf8');

const hexColor = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const attribute = (tag, name) => {
  for (const match of tag.matchAll(/\s([\w:-]+)="([^"]*)"/g)) if (match[1] === name) return match[2];
  return undefined;
};
const rootTag = svg => /<svg\b[^>]*>/.exec(svg)[0];
const title = svg => /<title>([^<]*)<\/title>/.exec(svg)?.[1];
const texts = svg => [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)]
  .map(match => ({ fill: attribute(match[1], 'fill'), content: match[2].replace(/<[^>]+>/g, '') }));

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex) {
  const digits = hex.length === 4 ? [...hex.slice(1)].map(c => c + c).join('') : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// The first rect that covers the whole viewBox with a solid colour is the
// background every text element sits on.
function background(svg) {
  const [, width, height] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(rootTag(svg)) ?? [];
  for (const [tag] of svg.matchAll(/<rect\b[^>]*>/g)) {
    const at = name => Number(attribute(tag, name) ?? 0);
    if (attribute(tag, 'width') === width && attribute(tag, 'height') === height && at('x') === 0 && at('y') === 0
      && hexColor.test(attribute(tag, 'fill') ?? '')) return attribute(tag, 'fill');
  }
  return undefined;
}

// SMIL keeps running whatever CSS says, so reduced motion can only remove an
// animated element from rendering. Each SMIL animation's target is its parent
// element, or, for an animated gradient or pattern, every element painted with
// it. Returns those targets as open tags.
function smilTargets(svg) {
  const stack = [];
  const targets = [];
  const paintServers = [];
  for (const match of svg.matchAll(/<(\/?)([A-Za-z]+)\b[^>]*?(\/?)>/g)) {
    const [tag, closing, name, selfClosing] = match;
    if (closing) { stack.pop(); continue; }
    if (['animate', 'animateTransform', 'animateMotion', 'set'].includes(name)) {
      const parent = stack.at(-1);
      if (/^(?:linearGradient|radialGradient|pattern)$/.test(parent.name)) paintServers.push(attribute(parent.tag, 'id'));
      else targets.push(parent.tag);
    }
    if (!selfClosing) stack.push({ name, tag });
  }
  for (const id of paintServers) {
    const painted = [...svg.matchAll(/<[A-Za-z]+\b[^>]*>/g)].map(match => match[0])
      .filter(tag => attribute(tag, 'fill') === `url(#${id})` || attribute(tag, 'stroke') === `url(#${id})`);
    assert.ok(painted.length, `animated paint server #${id} paints nothing`);
    targets.push(...painted);
  }
  return targets;
}

test('the profile artwork set is complete', () => {
  assert.equal(files.length, 18);
  for (const name of files.filter(name => name.endsWith('-dark.svg'))) {
    assert.ok(files.includes(name.replace(/-dark\.svg$/, '-light.svg')), `${name} has no light variant`);
  }
});

test('every artwork is an image with a matching accessible name and title', () => {
  for (const name of files) {
    const svg = read(name);
    const root = rootTag(svg);
    assert.equal(attribute(root, 'role'), 'img', `${name} root needs role="img"`);
    const label = attribute(root, 'aria-label');
    assert.ok(label && label.trim(), `${name} needs a non-empty aria-label`);
    assert.equal(title(svg), label, `${name} needs a <title> equal to its aria-label`);
    assert.ok(svg.slice(root.length).trimStart().startsWith('<title>'), `${name}: <title> must be the first child`);
  }
});

test('every animated artwork honours prefers-reduced-motion', () => {
  const reducedMotion = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/;
  for (const name of files) {
    const svg = read(name);
    const animated = /<(?:animate|animateTransform|animateMotion|set)\b/.test(svg) || /animation\s*:/.test(svg);
    if (!animated) continue;
    assert.match(svg, reducedMotion, `${name} animates without a prefers-reduced-motion rule`);
    const targets = smilTargets(svg);
    if (!targets.length) continue;
    assert.match(svg, /prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{[^}]*\.motion\s*\{\s*display\s*:\s*none/,
      `${name} must hide .motion under reduced motion`);
    for (const tag of targets) {
      assert.ok((attribute(tag, 'class') ?? '').split(/\s+/).includes('motion'), `${name}: SMIL-animated ${tag} needs class="motion"`);
    }
  }
});

test('every text meets WCAG AA contrast against its artwork background', () => {
  for (const name of files) {
    const svg = read(name);
    const canvas = background(svg);
    assert.ok(canvas, `${name} has no solid full-canvas background rect`);
    const items = texts(svg);
    assert.ok(items.length, `${name} has no text`);
    for (const { fill, content } of items) {
      assert.ok(hexColor.test(fill ?? ''), `${name}: "${content}" needs a hex fill`);
      const ratio = contrast(fill, canvas);
      assert.ok(ratio >= 4.5, `${name}: "${content}" is ${ratio.toFixed(2)}:1 (${fill} on ${canvas}); AA needs 4.5:1`);
    }
  }
});

test('dark and light variants carry the same words', () => {
  for (const dark of files.filter(name => name.endsWith('-dark.svg'))) {
    const light = dark.replace(/-dark\.svg$/, '-light.svg');
    const [a, b] = [read(dark), read(light)];
    assert.equal(attribute(rootTag(a), 'aria-label'), attribute(rootTag(b), 'aria-label'), `${dark} and ${light} labels differ`);
    assert.deepEqual(texts(a).map(t => t.content), texts(b).map(t => t.content), `${dark} and ${light} text differs`);
  }
});

test('the contrast helper matches published WCAG reference ratios', () => {
  assert.equal(contrast('#000000', '#FFFFFF').toFixed(2), '21.00');
  assert.equal(contrast('#FFF', '#FFFFFF').toFixed(2), '1.00');
  assert.equal(contrast('#767676', '#FFFFFF').toFixed(2), '4.54');
});
