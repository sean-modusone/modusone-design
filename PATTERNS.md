# Modus One — UX patterns

The interaction layer of the design system: how choices, tables, figures, plans, undo and notices behave.
Tokens (colour, type) live in `src/tokens.json`; this file is how they're used. Every Modus One app imports
it into its `CLAUDE.md`, so each working session in any app starts from the same patterns.

**The rule for every app:** a new UX pattern is added here, in the same change that introduces it, with a
line in the adoption table saying whether the other apps should take it up. Never invent a local variant
of a pattern that exists here; if it doesn't fit, change it here. Release a tag, then bump each app's pin.

Reference code is named per app. Where two apps hold a copy of the same component, both copies must behave
identically until the component moves into this package.

---

## Themes

Two themes share these patterns. **Deep Field** is the corporate theme: the site, decks, documents, finance
and compliance tools. **Horizon** is the consumer theme: apps people use in their own time. Paper is
Horizon's light mode and Forest its dark. An app picks one theme and names it in its `CLAUDE.md`.

Behaviour is the same in both. What differs is voice and look, so where a section below describes a Deep
Field look, a Horizon app substitutes:

| | Deep Field | Horizon |
|---|---|---|
| Tokens | `@modusone/design/css`, `--m1-*` | `@modusone/design/horizon.css`, `--hz-*` |
| Default mode (principle 10) | dark | light |
| Headline (principle 1) | uppercase Archivo, exactly one italic word | sentence case Bricolage 800, second clause in `soft`, ends with a full stop: "Two slipped. Six on the way." |
| Colour jobs (principle 6) | `spark`, `accent`, `accent2`, `positive`/`negative` | `lead`: you can press it, you are on it, or it is done. `signal`: it needs you. Nothing else is coloured |
| Surfaces (principle 7) | hairlines, 8px corners, no fills | filled `surface` cards at 20px, 12px fields, pills for buttons, chips and the dock. Still no shadows or gradients |
| Motion (§15) | no overshoot | a slight overshoot: `stiffness 280, damping 25` |
| Navigation (§16) | header or sidebar; bottom bar on touch | a floating dock at every width, with "jump to anything" in it |
| First screen | the answer as a headline, then the table | the answer, then up to three "do next" cards, then the list |
| Logo | ring stroke 2, Archivo wordmark | ring stroke 3, Bricolage wordmark (`modus` 500, `one` 800). Same geometry |

Horizon was written from a prototype on 5 Oct 2026. No app has adopted it yet; the first one that does adds
its column to the adoption table.

---

## 1. Principles

1. **A screen answers a question.** Its headline is the answer, in words: "One account goes *below* zero",
   "Eating out running *ahead*". Archivo 800 uppercase with **exactly one** Newsreader-italic word
   (`.italic`, spark). If it takes more than a glance, the screen has failed.
2. **Never flatter.** Available balance, not balance. Income suggestions round **down**, spending
   suggestions round **up** (both to €10). A stale number is labelled stale. An empty state says what's
   missing rather than looking comfortable.
3. **The UI does no arithmetic on money.** Sums, differences, rounding and projections come from the
   database. Money is exact end to end (integer cents or `numeric(14,2)` as decimal strings), never a
   float. The UI formats and colours.
4. **Every figure has a source one click away.** See §6.
5. **Tokens only.** No hex, `rgb()` or font name in app code. Values the package lacks are derived with
   `color-mix()` from tokens in the app's CSS. A genuinely new colour is added here first.
6. **Each colour does one job.** `spark`: the italic word and the logo dot. `accent`: structure: rules,
   active nav, focus, links, clickable-figure underlines. `accent2`: mono labels ≤13px.
   `positive`/`negative`: meaning in figures and statuses, never decoration, never the only cue.
   Primary buttons are the ink pill (`pill`/`pillink`).
7. **Hairlines, not boxes.** No shadows, no gradients. A card is `bg2` with a 2px `accent` top rule.
8. **Figures:** tabular numerals always. True minus sign (`−€23.00`). `+` only where direction is the point
   (money in, free to move).
9. **Dates:** `dd/mm/yyyy` in tables, forms and documents. At-a-glance prose may say "14 Oct", "Today",
   "Tomorrow".
10. **Both themes, both widths.** Dark on `:root`, light via `data-theme="light"`; follow the OS until
    the header toggle is used, then remember it. Every screen works at 390px with no horizontal page scroll.

---

## 2. Choices: the Picker

**No native `<select>`, anywhere.** Every single choice is the Picker: a button that reads like its
surroundings and opens a portalled list.

| Variant | Where | Looks like |
|---|---|---|
| `inline` | table cells | plain text until hovered; underline on hover |
| `field` (+ `boxed`) | forms | underlined like `.edfield`, or bordered like `.formfield` with `boxed` |
| `filter` | toolbars | mono, muted, underlined, thin chevron |

Behaviour, identical in every app:
- Click, Enter, Space or ↓ opens. Esc cancels and returns focus to the field.
- **Eight options or fewer:** opens straight to the list; typing a letter jumps to the first option starting
  with it (again moves to the next). **More than eight:** a search box, seeded with what was typed.
- ↑/↓ move, Enter picks. The current value opens highlighted with an accent left rule.
- **Group headings** in mono caps (`group` on each option). Searching drops the headings and ranks by
  label, then hint (a code, mono on the right), then group.
- The list is fixed-position, stays inside the window and flips above the field when there's no room below.
- `muted` options for "none"/"clear". A value not in the list shows `display` / `placeholder`, never blank.

Reference: Ledger `src/views/Picker.tsx`, `src/lib/picker.ts` (with tests). Budget holds a verbatim port.

## 3. Filter bar

`.filterbar`: an underlined search field (`input.searchfield`, grows to ~340px) followed by `filter`
Pickers, each with an "All …" first option. An extra filter that arrived by link (a category) shows as a
removable chip. **Filters live in the URL** (`#/transactions?period=…&envelope=…`), so any figure can link
straight to a filtered view and the back button works. A remembered toggle (Ledger's "Needs attention") is
a per-browser convenience in guarded `localStorage`.

Reference: Ledger `src/views/Transactions.tsx`; Budget `src/views/Transactions.tsx`, `src/lib/route.ts`.

## 4. Tables

- Headers: `th.th`, mono 10px caps, muted, hairline below. Figures right-aligned (`.num`), tabular.
- Rows: 12px padding, `line` hairline. Hover tint `--hover` where rows are actionable.
- **Children in the same grid.** Detail rows (categories under a budget) are indented rows in the **same
  columns** as their parent, never a nested table with its own headers.
- Column widths are set with `<colgroup>` and `table-layout: fixed` wherever rows expand, so columns don't
  shift when detail opens.
- **Under 760px a table becomes cards:** `thead` hidden, each row a grid, each cell labelled from
  `data-label` in mono caps above the value. The figure the screen exists for is largest.

Reference: Budget `src/index.css` (`table.period`, `table.ledger`, `.runway`).

## 5. Stat strip

`.statstrip`: a hairline-bounded row of `.stat` blocks (mono label, 22–27px figure, optional one-line
`.sub`). Wraps on narrow screens. A figure that needs attention uses `negative`, and its `.sub` says why.

## 6. Figures link to their evidence

Any aggregate a person might question (spent, received, a category total, an account) is a link to the
rows behind it, pre-filtered: `a.figlink`, which looks like the figure until hovered (accent underline).
Accounts or totals that have no rows by design (balance-only business accounts) are not links.

Reference: Budget `src/views/Period.tsx`, `src/views/Income.tsx`, `src/views/CashView.tsx`.

## 7. Planning with references

For any screen where a person sets amounts (budgets, expected income):
- **The value being set comes first**, right after the row label.
- **An eye in its column header** shows or hides the reference columns: **Last month · Usual month
  (12-month average) · Last year** (the same month a year earlier). References show automatically while
  nothing is set; after that the eye's state is remembered per browser.
- **Three ways to set a value**, all equivalent: type it; **click a reference figure** to use it for that
  row (dashed underline marks it clickable); or **use all** under a reference header to set every row
  from that column (rounded per principle 2).
- Values that can't be set (bills planned from commitments, top-ups that must never be expected) show as
  figures, not inputs, with a one-line reason in the row note.

Reference: Budget `src/views/PlanBits.tsx`, `src/views/Period.tsx`, `src/views/Income.tsx`.

## 8. Inline editing

`.planinput`: an underlined field inside the cell. Enter or blur saves; Esc reverts; empty clears (deletes
the row rather than storing zero); a bad value turns the underline `negative` and keeps the draft. No
save button.

## 9. Bulk actions and undo

- Bulk and destructive actions (**use all**, **Clear all**) run at once, **without a confirmation dialog**,
  and show an **undo bar**: `bg2`, accent left rule, "<what happened>. Undo · Dismiss".
- Undo restores the exact prior state. The screen snapshots before acting; the server replaces the set
  in **one transaction** (`replace_plans`-style function) so a half-applied undo can't happen.
- An individual reversible link (a payment matched to an invoice) gets an inline "Undo" text button.

Reference: Budget `src/views/Period.tsx` (`bulk`, `doUndo`) with `replace_plans()` / `replace_income_plans()`;
Ledger `src/views/Plans.tsx`, `src/views/Invoices.tsx` (inline undo).

## 10. Notices, callouts, flags

| | Use | Look |
|---|---|---|
| `.notice` | context the reader should know ("Nicola's accounts aren't connected") | muted text, `line2` left rule |
| stale / alarm note | a figure can't be trusted, or money is short | `negative` left rule, mono caps tag |
| `.callout` | a decision is waiting ("No plan for September yet") with its buttons | `bg2`, 2px `accent` top rule |
| `.undobar` | §9 | `bg2`, `accent` left rule |
| `.flag` | a state on a row: SHORT, STALE, DETECTED · 85%, SMALL & OFTEN | mono 9.5px caps pill, hairline border |
| `.toast` | brief confirmation that needs no action | ink pill, bottom centre |

Status words are mono caps; colour follows meaning (`negative` for trouble), never on its own.

## 11. Dialogs

Prefer inline editing and undo to dialogs. When a dialog is needed (a form that doesn't fit a row): Ledger's
`Modal`, portalled, `--scrim` backdrop, Esc and backdrop-click close, `role="dialog"` with a label.

Reference: Ledger `src/views/Modal.tsx`.

## 12. Honest states

- **Loading:** a muted "Loading…". No spinners on data that arrives in under a second. Loads over a second:
  see §21 (proposed).
- **Error:** `.error` in `negative`, saying what failed ("Could not load the period: …").
- **Empty:** what isn't there and what would fill it ("No budget periods yet. They open when a salary
  lands."). An empty forecast shows today's balance as today's low point, never a comfortable runway.
- **Stale:** data older than the freshness threshold is labelled with its age and muted; the alarm still
  shows.

## 13. Suggestions with their evidence

When the app infers something (a seasonal cost, a yearly bill, a shortfall), it is shown as a **suggestion**,
never applied silently:
- A list item (`.hu`): a `.flag` naming the kind (SEASONAL, YEARLY), a bold title, the figure on the right,
  one line saying how it was worked out ("Usually €1,145.97 in November (one year), against €205.00 in a usual
  month"), then an **evidence line**: the actual payments it rests on, in mono, with their dates.
- **Actions** sit under it: the confirming one (Add to commitments, Plan €1,120 a month) and **Dismiss**.
  A dismissal is remembered server-side; dismissed items hide behind "N dismissed · Show them", where they
  can be brought back.
- A one-click fix that changes a plan follows §9: it applies at once and offers Undo.
- Where the fix can't apply (an account that isn't connected), the row says why in plain words instead of
  showing a disabled button.

Reference: Budget `src/views/ComingUp.tsx` with `seasonal_outlook()`, `yearly_items()`, `sinking_outlook()`.

## 14. Charts: an answer against a reference

The Modus One chart is usually **one answer and one reference**, not a set of equal categories ("with the
plan" against "bills only", this year against last year). Follow the dataviz skill's procedure, with these
brand parameters:
- **The answer** is `accent` (terracotta), **the reference** is `muted` grey, both 2px lines with round joins.
  Validated with the skill's checker (light: CVD ΔE 9.9, normal 16.9; dark: 13.1 / 18.4; contrast ≥ 3:1).
  The grey fails the *categorical* chroma check by design: it's a de-emphasis, not a category, so identity
  never rests on colour: a line-key legend above, direct end labels (dropped when they'd collide or on a
  phone), a crosshair readout naming both, and a "Show as a table" view.
- Gridlines are `line` hairlines; **the zero line is stronger** (ink at ~45%) because crossing it is the news.
  The answer's low point carries a dot (accent, 2px surface ring) and is restated in words under the chart.
- **Crosshair, not per-point hover:** it snaps to the nearest day, the readout lists both series with values
  first, and the arrow keys move it (the plot area is focusable). The readout flips side near the edge.
- Size from the container with a **callback ref** + `ResizeObserver` (an effect can miss a box that mounts
  after the first render). Under 520px: tighter margins, no end labels.
- Money is plotted with `Number()` for geometry only; every figure shown is formatted from the exact string.
- One axis, always. A second measure is a second chart.

Reference: Budget `src/views/ForecastChart.tsx` with `forecast_days()`.

---

## Motion, touch and wide screens (§15–§22)

> **Status: proposed.** These eight sections were written on 4 Oct 2026 from the Interaction Field Guide
> demos, *before* any app built them. That reverses the usual order (build, then describe), so each is a
> proposal until the first app builds it: it then gains a Reference line and its adoption cell changes from
> "proposed". If building it shows the description is wrong, change it here.
>
> The values in them (no overshoot, 8px corners, the solid bottom bar) are Deep Field's. A Horizon app takes the
> behaviours unchanged and substitutes the looks listed under Themes.

## 15. Motion

Two kinds of change, two values. Nothing else moves.

- **Spatial** (position, size, shape): a spring, `stiffness 170, damping 26, mass 1`. It settles without
  overshoot. Interrupting it redirects from the current position and speed; it never restarts.
  No fixed-duration curve for movement.
- **Effects** (colour, opacity): `150ms ease-out`. Never a spring.
- **No bounce.** Overshoot is decoration.
- **Reduced motion:** under `prefers-reduced-motion`, movement becomes a 120ms fade.
- **Money never animates between values.** A figure changes in one step. A rolling number shows amounts
  that were never true (principles 2 and 3).
- **Tokens** (from v1.5.0, `motion` in `src/tokens.json`): in CSS, `--m1-dur-spatial` with
  `--m1-ease-spatial` (the spring sampled from rest, generated by the build) and `--m1-dur-effects` with
  `--m1-ease-effects`; `--m1-dur-reduced` for the fade. In JS, `import { motion } from '@modusone/design'`
  for the stiffness, damping and mass. A CSS transition can't carry velocity, so anything dragged or
  interruptible (a sheet, a panel mid-open) uses the JS values. No app hard-codes either (principle 5).
- `npm test` fails if the spatial spring overshoots.

## 16. One pattern, two forms

Layout switches on available width (the 760px line from §4), never on device type. Targets are 44px on
touch; rows are 36–40px with a pointer.

| With a pointer (wide) | On touch (narrow) |
|---|---|
| Table (§4) | Cards (§4) |
| Detail in a panel beside the list (§19) | Bottom sheet (§17) |
| Modal (§11) | Bottom sheet (§17), opened at full height |
| Row actions on hover and focus (§18) | Swipe, plus the same actions inside the row's sheet (§18) |
| Header or sidebar navigation | Bottom bar: solid `bg2`, hairline top, at most five destinations, search among them |
| Command palette (§20) | Not offered; search lives in the bottom bar |
| Sticky toolbar | A large title that collapses into the bar as the list scrolls, tied to scroll position, never to a timer |

**Not adopted:** a translucent, floating bar. It needs blur and shadow to read (principle 7) and loses
legibility over figures. The bar is solid.

## 17. Bottom sheet

The touch form of the side panel and the Modal.

- Rises from the bottom over `--scrim`: `bg2`, hairline top, top corners 8px, no shadow.
- **Three stops:** peek (the title and first control), half, full. It follows the finger; on release it
  settles to the nearest stop, counting release speed (a flick travels further), on the spatial spring.
- Closes by dragging down, tapping the scrim, Esc, or a visible **Done**. Never by drag alone.
- The screen behind stays visible and, at peek, usable.
- `role="dialog"` with a label. Focus moves in on open and back to the trigger on close (as §11).

## 18. Row actions

- **Pointer:** a row's actions appear on hover **and on keyboard focus**, right-aligned, in the same place
  on every row, fading in on the effects timing. Their width is reserved, so figures don't shift.
- **Touch:** there is no hover, so nothing may depend on it. Swipe left performs the row's primary action;
  the same actions sit in the row's sheet.
- Every action here is also reachable from the detail view and the palette (§20).
- Reversible actions follow §9: at once, then Undo. On touch the undo bar sits above the bottom bar.

## 19. Detail beside the list

- Selecting a row opens its detail in a panel to the right. The list stays, keeps its scroll position, and
  ↑/↓ move the selection with the panel following.
- The selection lives in the URL (§3): a refresh or a link lands on the same row with the panel open.
- Esc closes the panel and returns focus to the row.
- The panel opens on the spatial spring. Where a row's title or figure also heads the panel, it moves there
  as one element (View Transitions API where supported, a plain swap where not). One shared element per
  transition.
- Fields in the panel edit in place (§8).
- Narrow: the sheet (§17).

## 20. Command palette

- **⌘K / Ctrl K** opens it from anywhere. A visible "Search" control shows the shortcut: the palette adds
  to navigation and never replaces it.
- It reaches every destination and runs every frequent action. Results group under mono-caps headings
  (Go to, Actions) and each shows its own shortcut on the right, which is how shortcuts get learnt.
- **It is the Picker's list** (§2): same ranking (label, then hint, then group), same ↑/↓, Enter and Esc,
  same highlight. Don't build a second list.
- One command registry per app: name, group, optional shortcut, function. Menus, shortcuts and the palette
  all read from it.
- Every frequent action has a shortcut, shown beside the action wherever it appears.

## 21. Optimistic saves, and the control that reports

- **The value you typed appears at once** (§8 already behaves this way). Figures derived from it (totals,
  free to move, the forecast) are **not** guessed: they mute as stale (§12) until the database returns them
  (principle 3).
- **A failed save stays where it is:** the draft remains, `negative` underline, with what failed and
  **Retry** beside it. Nothing vanishes.
- **A button that starts work reports it in place:** label → "Saving…" → "Saved" for about a second →
  label, at a constant width. No separate toast for the same event.
- **Never optimistic:** anything that moves money or can't be undone. Those wait for the server and say so.
- **Loads over a second** show placeholder rows in the shape of what's coming (`bg2` bars on the row grid)
  in place of "Loading…". Under a second, still nothing (§12).

## 22. Streamed text

Where an app shows generated prose (why a period runs short, a summary of a month):

- It appears in the screen it concerns, not in a chat panel.
- It arrives as it is generated, with **Stop** visible until it finishes.
- It ends with an evidence line as §13: the rows or figures it rests on, linked (§6). Generated text never
  states a figure the database didn't supply (principle 3).
- It closes with two or three next steps as buttons, not an empty input.
- It is a suggestion (§13): nothing it proposes is applied without the confirming action.

---

## Adoption

| Pattern | Ledger | Budget |
|---|---|---|
| Picker (§2) | ✓ reference | ✓ port |
| Filter bar in URL (§3) | ✓ (status only) | ✓ |
| Children in the same grid, table → cards (§4) | to adopt: wide tables scroll inside their box today | ✓ |
| Stat strip (§5) | ✓ | ✓ |
| Figures link to evidence (§6) | partial (bank feed → transactions) | ✓ |
| Planning with references, eye (§7) | to adopt: Forecast / Planned | ✓ |
| Inline editing (§8) | ✓ | ✓ |
| Bulk undo bar (§9) | to adopt where bulk actions exist | ✓ |
| Inline undo (§9) | ✓ | — |
| Modal, toast (§10–11) | ✓ | — (not needed yet) |
| Suggestions with evidence (§13) | to adopt wherever Ledger suggests (bank-feed matches, recurring items) | ✓ |
| Charts: answer against reference (§14) | to adopt: Forecast | ✓ |
| Motion values (§15) | proposed | proposed |
| Narrow forms: bottom sheet, bottom bar (§16–17) | proposed | proposed |
| Row actions on hover and focus, swipe (§18) | proposed | proposed |
| Detail beside the list (§19) | proposed | proposed |
| Command palette (§20) | proposed | proposed |
| Optimistic saves, reporting button, placeholder rows (§21) | proposed | proposed |
| Streamed text (§22) | proposed | proposed |

When an app adopts a pattern, update its cell in the same change. "proposed" marks §15–22: described before being built.
The first app to build one supplies its Reference line and replaces the cell.

---

## Adding or changing a pattern

1. Build it in the app that needs it, following the nearest existing pattern.
2. In the same piece of work, describe it here: what, when, behaviour, reference file, adoption row.
3. `npm run build && npm test`, bump the version, commit, tag (`git tag v1.x.0`) and push the tag.
4. Bump the pin in each app (`github:sean-modusone/modusone-design#v1.x.0`) so the next session there
   reads the new pattern.
