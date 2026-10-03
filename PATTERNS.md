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

- **Loading:** a muted "Loading…". No spinners on data that arrives in under a second.
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

When an app adopts a pattern, update its cell in the same change.

---

## Adding or changing a pattern

1. Build it in the app that needs it, following the nearest existing pattern.
2. In the same piece of work, describe it here: what, when, behaviour, reference file, adoption row.
3. `npm run build && npm test`, bump the version, commit, tag (`git tag v1.x.0`) and push the tag.
4. Bump the pin in each app (`github:sean-modusone/modusone-design#v1.x.0`) so the next session there
   reads the new pattern.
