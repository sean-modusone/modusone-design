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
const onGround = ['ink', 'muted', 'accent', 'accent2', 'spark', 'positive', 'negative'];

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

/* Motion: PATTERNS.md §15 says the brand does not bounce. This makes that a fact. */
test('motion tokens are complete and documented', () => {
  for (const k of ['spatial', 'effects', 'reduced']) {
    assert.ok(T.motion?.[k], `motion.${k} missing`);
    assert.ok(T.motion[k].job, `motion.${k} missing a documented job`);
  }
  for (const k of ['stiffness', 'damping', 'mass']) assert.ok(T.motion.spatial[k] > 0, `motion.spatial.${k} must be positive`);
  for (const k of ['effects', 'reduced']) assert.ok(T.motion[k].durationMs > 0 && T.motion[k].durationMs <= 200, `motion.${k} should be a short fade`);
});

test('the spatial spring settles without overshoot', () => {
  const { stiffness: k, damping: c, mass: m } = T.motion.spatial;
  let x = 0, v = 0, peak = 0;
  for (let t = 0; t < 3; t += 0.001) { v += ((-k * (x - 1) - c * v) / m) * 0.001; x += v * 0.001; peak = Math.max(peak, x); }
  assert.ok(peak <= 1.005, `spring overshoots by ${((peak - 1) * 100).toFixed(1)}%. Raise damping to at least ${(2 * Math.sqrt(k * m)).toFixed(1)}.`);
  assert.ok(Math.abs(x - 1) < 0.001, 'spring has not settled after 3s');
});

test('generated motion output matches tokens.json', async () => {
  const css = readFileSync(new URL('../dist/modus-one.css', import.meta.url), 'utf8');
  assert.ok(css.includes(`--m1-dur-effects:  ${T.motion.effects.durationMs}ms`), 'dist CSS is stale: effects duration. Run npm run build.');
  assert.ok(css.includes(`--m1-dur-reduced:  ${T.motion.reduced.durationMs}ms`), 'dist CSS is stale: reduced duration. Run npm run build.');
  assert.match(css, /--m1-ease-spatial: linear\(0, [\d., ]+, 1\);/, 'dist CSS is missing the generated spatial easing. Run npm run build.');
  const { motion } = await import('../dist/tokens.js');
  assert.equal(motion.spatial.stiffness, T.motion.spatial.stiffness, 'dist/tokens.js is stale. Run npm run build.');
  assert.equal(motion.spatial.damping, T.motion.spatial.damping, 'dist/tokens.js is stale. Run npm run build.');
});

/* Horizon: the consumer theme. Same floor, its own pairings. */
const H = T.horizon;
for (const mode of ['light', 'dark']) {
  for (const ground of ['ground', 'surface']) {
    for (const key of ['ink', 'soft', 'lead', 'signalText']) {
      test(`horizon ${key} on ${ground} (${mode}) clears ${FLOOR}:1`, () => {
        const r = ratio(H.color[key][mode], H.color[ground][mode]);
        assert.ok(r >= FLOOR, `horizon ${key} on ${ground} ${mode} = ${r.toFixed(2)}:1, floor is ${FLOOR}`);
      });
    }
  }
  for (const [fg, bg] of [['onLead', 'lead'], ['onSignal', 'signalFill'], ['dockInk', 'dock']]) {
    test(`horizon ${fg} on ${bg} (${mode}) clears ${FLOOR}:1`, () => {
      const r = ratio(H.color[fg][mode], H.color[bg][mode]);
      assert.ok(r >= FLOOR, `horizon ${fg} on ${bg} ${mode} = ${r.toFixed(2)}:1`);
    });
  }
  test(`horizon signal marker on ground (${mode}) clears 3:1`, () => {
    const r = ratio(H.color.signal[mode], H.color.ground[mode]);
    assert.ok(r >= 3, `horizon signal on ground ${mode} = ${r.toFixed(2)}:1, non-text floor is 3`);
  });
}

test('every horizon colour token defines both modes and a job', () => {
  for (const [k, v] of Object.entries(H.color)) {
    assert.ok(v.light, `horizon ${k} missing light`);
    assert.ok(v.dark, `horizon ${k} missing dark`);
    assert.ok(v.job, `horizon ${k} missing a documented job`);
  }
});

test('the horizon spring overshoots slightly, and only slightly', () => {
  const { stiffness: k, damping: c, mass: m } = H.motion.spatial;
  let x = 0, v = 0, peak = 0;
  for (let t = 0; t < 3; t += 0.001) { v += ((-k * (x - 1) - c * v) / m) * 0.001; x += v * 0.001; peak = Math.max(peak, x); }
  const over = (peak - 1) * 100;
  assert.ok(over > 0.5, `horizon spring does not overshoot (${over.toFixed(1)}%). That is Deep Field's feel.`);
  assert.ok(over <= 6, `horizon spring overshoots by ${over.toFixed(1)}%; the ceiling is 6%.`);
  assert.ok(Math.abs(x - 1) < 0.001, 'horizon spring has not settled after 3s');
});

test('the horizon lens keeps the Deep Field geometry', () => {
  assert.equal(H.logo.grid, 44); assert.equal(H.logo.ringRadius, 20); assert.equal(H.logo.dotRadius, 6);
});

test('generated horizon output matches tokens.json', async () => {
  const css = readFileSync(new URL('../dist/horizon.css', import.meta.url), 'utf8');
  for (const [k, v] of Object.entries(H.color)) {
    assert.ok(css.includes(v.light), `dist/horizon.css is stale — missing ${k} light (${v.light}). Run npm run build.`);
    assert.ok(css.includes(v.dark), `dist/horizon.css is stale — missing ${k} dark (${v.dark}). Run npm run build.`);
  }
  const { horizon } = await import('../dist/tokens.js');
  assert.equal(horizon.motion.spatial.damping, H.motion.spatial.damping, 'dist/tokens.js is stale. Run npm run build.');
  assert.equal(horizon.color.lead.light, H.color.lead.light, 'dist/tokens.js is stale. Run npm run build.');
});
