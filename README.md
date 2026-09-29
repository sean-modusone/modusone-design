# @modusone/design

The Modus One design system — Deep Field tokens, typography and primitives.
Source of truth is the live site at [modusone.io](https://www.modusone.io); this package
is that system made installable.

## Install

The repo is public, so this works everywhere — including CI and Netlify build servers —
with no registry account and no auth token:

```bash
npm install github:sean-modusone/modusone-design
```

Pin to a release rather than tracking `main`, so a brand change never lands in an app
without you choosing it:

```bash
npm install github:sean-modusone/modusone-design#v1.1.0
```

## Use

**Plain CSS / any framework** — import once, before your own styles:

```js
import '@modusone/design/css';
```

```css
@import '@modusone/design/css';
```

Then build from the tokens:

```css
.thing { background: var(--m1-bg2); color: var(--m1-ink); border-top: 2px solid var(--m1-accent); }
```

**JavaScript** — for charts, canvas, React Native, anything that isn't CSS:

```js
import { color, font } from '@modusone/design';
color.spark.dark;   // '#7EDBB6'
font.display;       // "'Archivo', 'Helvetica Neue', …"
```

**Tailwind** — adds `m1-*` colours and fonts that resolve through the CSS variables,
so the theme toggle keeps working:

```js
// tailwind.config.js
module.exports = { presets: [require('@modusone/design/tailwind')] };
```

```html
<h1 class="font-m1-display text-m1-ink">…</h1>
```

**Fonts** — all three are on Google Fonts:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&family=IBM+Plex+Mono&family=Newsreader:ital,wght@1,400;1,500&display=swap">
```

Self-host or subset-and-embed if the app needs zero external requests — the website does
the latter.

## What's in it

| Import | What |
| ------ | ---- |
| `@modusone/design/css` | Tokens as `--m1-*` custom properties plus primitives (`.m1-display`, `.m1-em`, `.m1-eyebrow`, `.m1-kicker`, `.m1-numeral`, `.m1-lede`, `.m1-body`, `.m1-btn`, `.m1-card`, `.m1-rule`, `.m1-logo`) |
| `@modusone/design` | `color`, `font`, `contrastFloor` as JS |
| `@modusone/design/tokens.json` | The same, machine-readable, with the documented job of every token |
| `@modusone/design/tailwind` | Tailwind preset |
| `PATTERNS.md` | UX patterns shared by every app: Picker, filter bar, tables, planning with references, undo, notices. Import it from each app's `CLAUDE.md` with `@node_modules/@modusone/design/PATTERNS.md` |

## The rules that matter

Dark is the default; light is a `[data-theme="light"]` override on the root, not a second
design. Three typefaces, each with one job — Archivo (display and body), Newsreader
*italic only* (one accent phrase per headline, and numerals), IBM Plex Mono (uppercase
labels ≤13px). Three accents, each with one job:

- `--m1-spark` (mint) is **the voice** — the single italic phrase in a headline, and the lens dot.
- `--m1-accent` (terracotta) is **structure** — numerals, rules, focus rings.
- `--m1-accent2` is **labels only** — mono eyebrows and kickers, never above 13px.

Swapping those three is the fastest way to look almost-right-but-off.

Two **signal** tokens exist for apps that must colour a figure by what it means
(v1.1.0):

- `--m1-positive` — money in, paid, repayable, confirmed.
- `--m1-negative` — money out, owed, overdue, payable, needs attention.

They share the hues of `spark` and `accent` on purpose, so no new colour enters the
palette, but they are separate tokens with a separate job: figures and status only, never
decoration or headlines, and never the only cue — pair them with a sign, a word or a
position. In app code, use these rather than `spark`/`accent` whenever the colour carries
meaning.

Hairlines separate sections, not boxes. If something genuinely needs to be a card it gets
`--m1-bg2` and a 2px terracotta top rule — no border, no shadow, no rounding past 8px.

The logo is `modus` regular + **`one` bold**. The bold is on *one*.

## Changing a token

`src/tokens.json` is the only place a colour is ever edited. Everything in `dist/` is
generated:

```bash
npm run build    # regenerate dist/ and tailwind.cjs
npm test         # contrast + drift checks
```

`npm test` fails if any text token drops below WCAG AA on its own ground, and if `dist/`
has drifted from `src/tokens.json`. Measured minimum across the system is **4.90:1**
(`accent` on light ground, used only for 46px numerals, rules and focus rings, where the
requirement is 3:1).

Tag a release after changing tokens so apps can upgrade deliberately:

```bash
git tag v1.1.0 && git push --tags
```
