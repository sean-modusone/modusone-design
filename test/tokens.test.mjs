/* The brand claims every text colour clears 5.07:1 on its own ground.
   This test is what makes that a fact rather than a memory. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const T = JSON.parse(readFileSync(new URL('../src/tokens.json', import.meta.url), 'utf8'));

const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const FLOOR = T.$meta.contrastFloor;
const onGround = ['ink', 'muted', 'accent', 'accent2', 'spark'];

for (const mode of ['dark', 'light']) {
  const bg = T.color.bg[mode];
  for (const key of onGround) {
    test(`${key} on bg (${mode}) clears ${FLOOR}:1`, () => {
      const r = ratio(T.color[key][mode], bg);
      assert.ok(r >= FLOOR, `${key} ${mode} = ${r.toFixed(2)}:1, floor is ${FLOOR}`);
    });
  }
  test(`primary button text on its fill (${mode}) clears ${FLOOR}:1`, () => {
    const r = ratio(T.color.pillink[mode], T.color.pill[mode]);
    assert.ok(r >= FLOOR, `pill ${mode} = ${r.toFixed(2)}:1`);
  });
}

test('every colour token defines both themes', () => {
  for (const [k, v] of Object.entries(T.color)) {
    assert.ok(v.dark, `${k} missing dark`);
    assert.ok(v.light, `${k} missing light`);
    assert.ok(v.job, `${k} missing a documented job`);
  }
});

test('generated CSS matches tokens.json', () => {
  const css = readFileSync(new URL('../dist/modus-one.css', import.meta.url), 'utf8');
  for (const [k, v] of Object.entries(T.color)) {
    assert.ok(css.includes(v.dark), `dist CSS is stale — missing ${k} dark (${v.dark}). Run npm run build.`);
    assert.ok(css.includes(v.light), `dist CSS is stale — missing ${k} light (${v.light}). Run npm run build.`);
  }
});
