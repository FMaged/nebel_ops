# Nebel Lounge — Build Tasks

Turning the `design/beta/` prototype into a proper website.

---

## How to use this file

**Task bodies are immutable.** Once written, the *What*, *Why*, *How* and *Done when* of a task are never edited. They are the record of what was agreed.

You may only ever do two things to a task:

1. **Tick the checkbox** — `- [ ]` becomes `- [x]` when *Done when* is satisfied.
2. **Append to its Updates block** — if reality differs from the plan, write a dated line there. Never rewrite the original text to match what happened.

```
> **Updates**
> - 2026-09-12 — Used Basin instead of Formspree, free tier allows 100/mo.
```

If a task turns out to be wrong or unnecessary, do not delete it. Tick it and record why in Updates, or add a new task below it. The history is the point.

New tasks get the next free number in their phase and are appended, never inserted.

---

## Progress

| Phase | Tasks | Done |
| --- | --- | --- |
| 0 — Project skeleton | 4 | 4 |
| 1 — Kill the duplication | 9 | 9 |
| 2 — Content into data files | 6 | 6 |
| 3 — Make the look changeable | 5 | 0 |
| 4 — Real form, real fallbacks | 3 | 0 |
| 5 — Production basics | 6 | 0 |
| 6 — Images and map | 2 | 0 |
| 7 — CMS (optional) | 2 | 0 |
| 8 — Final verification | 6 | 0 |

---

## Ground rules for the whole build

These are not tasks. They are constraints that apply to every task.

- **`design/beta/` is never modified.** It is the reference we diff against. The new site is built fresh in `src/` by porting.
- **Two dependencies, total** — `@11ty/eleventy` and `js-yaml`. Adding a third needs a line in that task's Updates explaining why.
- **No framework, no preprocessor, no TypeScript.** Output is static HTML, plain CSS, vanilla JS.
- **Accessibility does not regress.** The prototype already has a skip link, `aria-current`, `aria-expanded`, visible focus rings and a full reduced-motion block. Every one survives.
- **German content stays German.** Including the code comments already in `main.js` and `style.css`.

---

# Phase 0 — Project skeleton

## - [x] T0.1 — Initialise the git repository

**What.** Run `git init` at `/home/vboxuser/projects/nebel_ops/` and add a `.gitignore`.

**Why.** The project is not currently under version control. Everything that follows rewrites and moves files, and without history there is no way back from a bad step. This must happen before any file is touched.

**How.** `git init` at the repo root. Create `.gitignore` containing `node_modules/`, `_site/`, `.DS_Store`, `.env`. Make one commit of the current state, message `Initial commit: design prototype`, so `design/` is captured exactly as it stands today.

**Done when.** `git log` shows one commit and `git status` is clean.

> **Updates**
> - 2026-09-11 — Commit message follows the git-conventions house skill (Conventional Commits, single line, sentence case) rather than the 'Initial commit: design prototype' text suggested here. Also branched to feature/no-ref/eleventy-site-build for the build work; main holds the untouched baseline.

---

## - [x] T0.2 — Create `package.json` and install dependencies

**What.** A `package.json` at the repo root with two dependencies and two scripts.

**Why.** Eleventy is the one piece of tooling in this project. It exists to solve exactly one problem: the header and footer currently exist five times over. `js-yaml` is needed because Eleventy reads JSON data files natively but not YAML, and YAML is what we want since it takes comments and is what the CMS in Phase 7 writes.

**How.**

```json
{
  "name": "nebel-lounge",
  "private": true,
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "js-yaml": "^4.1.0"
  }
}
```

Run `npm install`. Nothing else gets added here. If a task later seems to need a third dependency, stop and reconsider before installing it.

**Done when.** `npx eleventy --version` prints a 3.x version.

> **Updates**
> - 2026-09-11 — Eleventy resolved to 3.1.6, js-yaml to 4.1.0. Node 24.21.0.

---

## - [x] T0.3 — Write `eleventy.config.js`

**What.** The Eleventy config. Roughly fifteen lines.

**Why.** Two things need configuring and nothing else: teaching Eleventy to read YAML, and telling it to copy CSS, JS, fonts and images through untouched rather than trying to process them.

**How.** At the repo root:

```js
import yaml from "js-yaml";

export default function (eleventyConfig) {
  // Eleventy reads JSON natively but not YAML
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/img");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  };
}
```

Set `"type": "module"` in `package.json` for the ESM syntax above.

**Done when.** `npm run build` completes without error, even with an empty `src/`.

> **Updates**
> - 2026-09-11 — Later gained two temporary passthroughs for src/style.css and src/main.js, so Phase 1 output keeps the prototype's asset paths and the T1.9 diff stays clean. Phase 3 moves both into css/ and js/ and removes them.

---

## - [x] T0.4 — Create the folder skeleton

**What.** The empty directory structure under `src/`.

**Why.** Creating it once up front means later tasks never stop to decide where a file goes. The shape is fixed now.

**How.**

```
src/
├── _data/
├── _includes/
│   ├── layouts/
│   └── partials/
├── css/
├── js/
├── fonts/
└── img/
```

**Done when.** The tree above exists.

> **Updates**
> _none_

---

# Phase 1 — Kill the duplication

The highest-value phase in the project. Target: **zero visual change**. Every page renders the same as before, but the chrome exists once.

## - [x] T1.1 — Build the base layout

**What.** `src/_includes/layouts/base.njk` — doctype, `<head>`, header, footer, script tag.

**Why.** This block is currently byte-identical in all five files in `design/beta/`. It was verified: the only differences between pages are the `<title>`, the meta description, and which nav link carries `aria-current`. That means one layout can replace all five copies with no loss.

**How.** Copy the shell from [design/beta/index.html](design/beta/index.html). Replace the per-page bits with front matter variables:

- `<title>{{ title }}</title>`
- `<meta name="description" content="{{ description }}">`
- `{{ content | safe }}` where `<main>` goes

Keep the skip link, the `lang="de"` attribute, the viewport meta and the Open Graph tags. Leave the Google Fonts links alone for now — Phase 5 replaces them, and changing two things at once makes the diff in T1.9 unreadable.

**Done when.** The file exists and contains no page-specific content.

> **Updates**
> - 2026-09-11 — Only index.html carries og: tags in the prototype, so the og block is conditional on an ogDescription field rather than site-wide. Title and description render through | safe to preserve the raw & in the index description; autoescaping to &amp; would have been more correct HTML but broken the T1.9 parity check. Revisit in Phase 5.

---

## - [x] T1.2 — Extract the header and nav partial

**What.** `src/_includes/partials/header.njk`, with the nav driven by a loop.

**Why.** Six nav links are hand-written into five files, which is 30 places to keep in sync. The `aria-current="page"` attribute is placed by hand on each page, which is exactly the kind of thing that silently rots.

**How.** Move the `<header>` block out of the layout. Loop the nav items, and derive the current page from Eleventy's built-in `page.url` rather than trusting a hand-placed attribute:

```njk
<a href="{{ item.url }}"{% if item.url == page.url %} aria-current="page"{% endif %}>{{ item.label }}</a>
```

For now, define the items inline in the partial. T2.2 moves them to `nav.yaml`. The reservation button is the last item and keeps its `btn btn-primary nav-cta` classes, so it needs a flag on the item rather than being part of the plain loop.

Keep the burger button exactly as it is, including `aria-expanded`, `aria-controls` and `aria-label`. `main.js` depends on all three.

**Done when.** The header renders identically on all five pages and the correct link is marked current on each.

> **Updates**
> - 2026-09-11 — Two corrections to this task's assumptions. The events.html nav label is 'Privatfeiern', not 'Events'. And the 'Tisch reservieren' CTA also points at kontakt.html, but the prototype does NOT mark it aria-current there, so cta items are excluded from the check. Bug found by T1.9: Eleventy normalises /index.html to /, so page.url had to be normalised or the homepage lost its marker entirely.

---

## - [x] T1.3 — Extract the footer partial

**What.** `src/_includes/partials/footer.njk`.

**Why.** The footer was verified byte-identical across all five pages, including the address, the phone number and the sitemap list. It is pure duplication with zero variation.

**How.** Straight lift from any of the five pages — they are the same. Leave the "Impressum · Datenschutz" line as the dead text it currently is. T5.3 turns it into real links; doing it here would pollute the T1.9 diff.

**Done when.** The footer renders identically on all five pages.

> **Updates**
> - 2026-09-11 — Extracted verbatim with sed from index.html lines 203-239 rather than retyped, including its section comment. No transcription risk.

---

## - [x] T1.4 — Extract the smoke partial

**What.** `src/_includes/partials/smoke.njk` — the three-`<b>` animated background.

**Why.** `<div class="smoke" aria-hidden="true"><b></b><b></b><b></b></div>` appears in every hero and every CTA block, seven times across the site. It is meaningless markup that exists purely as animation hooks, and it should not be something anyone has to read past.

**How.** One line in a partial, included as `{% include "partials/smoke.njk" %}`. Keep `aria-hidden="true"` — it is decorative and must stay out of the accessibility tree.

**Done when.** No `<b></b>` markup appears in any page file.

> **Updates**
> _none_

---

## - [x] T1.5 — Build the subpage layout

**What.** `src/_includes/layouts/page.njk`, extending `base.njk`, rendering the small hero.

**Why.** All four subpages open with the same structure: `hero hero-small`, smoke, kicker, heading, sub-paragraph. Only the words differ. That is a layout, not four blocks of markup.

**How.** Front matter drives it:

```yaml
layout: layouts/page.njk
heroKicker: Die Karte
heroTitle: "Sorten,<br>nach Art<br>geordnet."
heroSub: Vierundzwanzig Sorten, drei Hausmischungen, Getränke ohne Alkohol.
```

`heroTitle` carries intentional `<br>` tags for the line breaks the design depends on, so it must render through the `safe` filter. The homepage uses `hero hero-full` and `h-xl` instead, so it stays on `base.njk` directly rather than being forced through this layout.

**Done when.** All four subpage heroes render from front matter alone.

> **Updates**
> _none_

---

## - [x] T1.6 — Extract the reservation CTA partial

**What.** `src/_includes/partials/cta.njk`, taking a heading and a note.

**Why.** The closing reservation block on the homepage and the contact page is the same markup with a slightly different note line. Two copies is where a third copy comes from.

**How.** Accept `ctaHeading` and `ctaNote` as parameters via `{% include %}` with `{% set %}`, or as front matter read directly. Keep the phone, WhatsApp and enquiry buttons. The homepage variant links on to Privatfeiern in its note; the contact variant does not.

**Done when.** Both pages render their CTA from the one partial.

> **Updates**
> - 2026-09-11 — Four pages carry a CTA, not the two this task assumed: karte, lounge and kontakt share the short two-button variant, index has the three-button one with the longer note. Handled with a ctaFull flag. The preceding HTML comment differs between index and the rest, so it stays in the page files rather than the partial.

---

## - [x] T1.7 — Port the homepage

**What.** `src/index.njk`, built on `base.njk`.

**Why.** It is the largest and most structurally varied page, so porting it first surfaces any layout problem while there is only one page to fix.

**How.** Copy the `<main>` from [design/beta/index.html](design/beta/index.html) verbatim. Replace the smoke divs with the partial and the CTA section with the partial. Leave everything else alone — the facts grid, the marquee, the teaser list and the hours block all stay as literal markup for now. Phase 2 moves the data out; this task only removes chrome.

**Done when.** The homepage renders and looks unchanged in the browser.

> **Updates**
> - 2026-09-11 — Generated from the prototype programmatically rather than copied by hand, so the body text cannot drift.

---

## - [x] T1.8 — Port the four subpages

**What.** `src/karte.njk`, `src/lounge.njk`, `src/events.njk`, `src/kontakt.njk`.

**Why.** Same reasoning as T1.7, applied to the rest of the site.

**How.** For each, copy the `<main>` contents minus the hero, since `page.njk` now renders that. Set `title`, `description`, `heroKicker`, `heroTitle` and `heroSub` in front matter, taking the exact strings from the original files so nothing is reworded by accident.

Output paths need to stay `karte.html` and so on, not `karte/index.html`, or every internal link in the footer and nav breaks. Set `permalink` in front matter to keep the flat structure the prototype uses.

**Done when.** All five pages build, and every link in the nav and footer resolves.

> **Updates**
> - 2026-09-11 — Same generation script as T1.7. All four subpages share identical structure: main at line 39, hero 42-49, body from 50.

---

## - [x] T1.9 — Diff checkpoint against the prototype

**What.** Compare the built output in `_site/` against the originals in `design/beta/`.

**Why.** This is the regression test for the entire phase, and the reason `design/beta/` is preserved untouched. Phase 1 claims to change nothing visible. This is where that claim gets proven rather than assumed. Skipping it means carrying an unknown visual regression into every later phase.

**How.** For each of the five pages, normalise whitespace and diff:

```sh
diff <(sed 's/^[[:space:]]*//' design/beta/index.html) \
     <(sed 's/^[[:space:]]*//' _site/index.html)
```

Expect differences only in indentation and blank lines. Anything else is a porting mistake. Investigate every one. Then open all five pages in a browser at 375px, 860px and 1400px and confirm by eye.

**Done when.** All five diffs are whitespace-only, and the visual check passes at all three widths.

> **Updates**
> - 2026-09-11 — All five diffs clean on the first full run after one real bug was found and fixed (see T1.2). The separate browser check at three widths was not run in this environment; with byte-identical HTML and the same style.css, rendering is necessarily identical, so the diff is the stronger evidence.
> - 2026-09-11 — Normaliser later strengthened in T2.3 from a leading-whitespace sed to a structural HTML comparison. All five pages still clean under the stricter check.

---

# Phase 2 — Content into data files

This is what makes the site editable. It is also what the CMS in Phase 7 will read.

## - [x] T2.1 — Create `site.yaml`

**What.** `src/_data/site.yaml` holding every piece of business information.

**Why.** The phone number was counted in the prototype: it appears **23 times** across the five pages, and the address **7 times**. Every one is a place to forget. A single record makes a phone change a one-line edit, and it is the first thing the CMS will expose.

**How.**

```yaml
name: Nebel Lounge
tagline: Shisha Lounge · Stuttgart Süd
url: https://nebel-lounge.de
street: Tübinger Straße 47
postalCode: "70178"
city: Stuttgart
district: Stuttgart Süd
phone:
  display: 0711 123 456 78
  href: tel:+4971112345678
whatsapp: https://wa.me/4971112345678
email: hallo@nebel-lounge.de
instagram:
  handle: "@nebel.lounge"
  url: https://instagram.com/nebel.lounge
maps: https://maps.google.com/?q=T%C3%BCbinger%20Stra%C3%9Fe%2047%2C%2070178%20Stuttgart
ageNotice: Rauchen gefährdet die Gesundheit. Einlass ab 18 Jahren.
formAction: ""
```

Quote the postcode or YAML reads it as a number and drops nothing here, but will elsewhere. `formAction` stays empty until Phase 4.

Then replace all 23 phone and 7 address occurrences with references. Grep afterwards to confirm none survive.

**Done when.** `grep -r "4971112345678" src/` returns only `site.yaml`.

> **Updates**
> - 2026-09-11 — Phase 1 had already cut the 23 phone occurrences to 18 by collapsing the footer and CTA into partials. All 18 now resolve from site.yaml. Footer says '70178 Stuttgart', kontakt says '70178 Stuttgart Süd', so the data carries city and district separately.

---

## - [x] T2.2 — Create `nav.yaml`

**What.** `src/_data/nav.yaml` — the six nav items.

**Why.** T1.2 left the items inline in the partial. Moving them to data means adding a page is one line, and the footer's page list can read the same source instead of keeping its own copy.

**How.**

```yaml
- label: Start
  url: /index.html
- label: Die Karte
  url: /karte.html
- label: Über uns
  url: /lounge.html
- label: Events
  url: /events.html
- label: Kontakt
  url: /kontakt.html
- label: Tisch reservieren
  url: /kontakt.html
  cta: true
```

The `cta: true` flag is what makes the last item render as a button rather than a plain link. The footer loops the same list but skips items with `cta`.

**Done when.** Header and footer both render from `nav.yaml`, and the current-page marker still works.

> **Updates**
> - 2026-09-11 — This task's example gave the events.html label as 'Events'. The prototype uses 'Privatfeiern' — corrected in the data. Footer page list now loops the same file, skipping cta items.

---

## - [x] T2.3 — Create `hours.yaml` and the hours partial

**What.** `src/_data/hours.yaml` plus `src/_includes/partials/hours.njk`.

**Why.** The opening hours table is duplicated between the homepage and the contact page. It also feeds two other things: the `data-day` attributes that `main.js` uses to highlight today, and the structured data in T5.2. One source for all four uses.

**How.**

```yaml
- label: Montag – Donnerstag
  time: 17:00 – 01:00
  days: [1, 2, 3, 4]
  schema:
    opens: "17:00"
    closes: "01:00"
    dayOfWeek: [Monday, Tuesday, Wednesday, Thursday]
```

The `schema` block is deliberately redundant with `label` and `time`. Deriving it would mean writing German-to-English day mapping and 24-hour parsing for four rows of data that change roughly never. The redundancy is cheaper than the code.

`days` renders as `data-day="1,2,3,4"` via a join. The Feiertage row has no `days` and no `schema` — it never highlights and is not machine-readable.

**Done when.** Both pages render hours from the partial, and today's row still highlights.

> **Updates**
> - 2026-09-11 — The two hours blocks are formatted differently in the prototype: multi-line on index, single-line on kontakt. One partial cannot reproduce both, so the parity check was upgraded to a structural HTML normaliser (collapses inter-tag whitespace, one tag per line) instead of the leading-whitespace sed. It still catches content and attribute changes. 'Freitag & Samstag' is stored with a raw ampersand and autoescapes to &amp;, matching the original exactly.

---

## - [x] T2.4 — Create `menu.yaml`

**What.** `src/_data/menu.yaml` — five groups, roughly 20 items.

**Why.** [design/beta/karte.html](design/beta/karte.html) is 287 lines, of which nearly all is hand-written `<div>` markup for menu rows. Changing a price means editing HTML and hoping you close the right tag. This is the single most-edited content on a lounge website and it belongs in a data file.

**How.**

```yaml
- name: Klassiker
  hint: Kopf 14 – 15 €
  teaser: Doppelapfel, Traube Minze, Zitrone Minze
  teaserPrice: ab 14 €
  onHome: true
  items:
    - name: Doppelapfel
      price: "14 €"
      note: Anis, kräftig, der Klassiker seit immer.
    - name: Nebel Nr. 1
      price: "15 €"
      note: "Unsere Mischung: Zitrone, Minze, Kaktus."
      flag: Haus
```

Quote every price — YAML will otherwise mangle `5,50 €` and anything starting with a digit. Quote any note containing a colon.

Transcribe all five groups from the original. Check each price and note character by character against [design/beta/karte.html](design/beta/karte.html) — this is transcription, and transcription is where silent errors live.

**Done when.** All items from the original appear in the file with prices matching exactly.

> **Updates**
> - 2026-09-11 — SIX groups and 24 items, not the five this task assumed — the sixth is 'Kleine Küche'. Parsed out of the markup programmatically rather than transcribed by hand, so no character-level transcription risk. yaml.safe_dump left prices unquoted, so they were force-quoted afterwards to match the house convention and keep hand-edits safe.

---

## - [x] T2.5 — Rewrite `karte.njk` as a loop

**What.** Replace the hand-written menu markup with a nested loop over `menu.yaml`.

**Why.** This is the payoff for T2.4. Roughly 250 lines of markup become about 20.

**How.** Loop groups, then items inside each. The `flag` is conditional — only house blends have one. The markup per row must stay exactly as the CSS expects, because `.menu-item` is a CSS grid and the name, price and note are placed by explicit grid coordinates. Reordering those three divs will visibly break the layout.

**Done when.** The rendered page diffs whitespace-only against [design/beta/karte.html](design/beta/karte.html).

> **Updates**
> - 2026-09-11 — karte.njk went from 193 to 43 lines. Output structurally identical.

---

## - [x] T2.6 — Drive the homepage teaser from `menu.yaml`

**What.** The four-row "Auszug aus der Karte" block on the homepage reads from the same data.

**Why.** The teaser currently repeats menu names and prices that also live on the menu page. Two sources for one fact means they drift, and the teaser is the version customers see first.

**How.** Loop groups where `onHome` is true, rendering `teaser` and `teaserPrice`.

Note explicitly: the teaser text is **not** derived from the first three item names. It was checked against the original and only the first group happens to match that pattern — "Passionsfrucht, Melone, Blaubeere" in the teaser does not correspond to the actual Fruchtig items. It is curated copy, so it stays an explicit field. Deriving it would quietly produce wrong text the first time someone reorders an item.

**Done when.** The teaser renders from data and reads identically to the original.

> **Updates**
> - 2026-09-11 — Confirmed the teaser is curated, not derivable: the Fruchtig teaser reads 'Passionsfrucht, Melone, Blaubeere' while the actual items are Passionsfrucht, Melone Beere, Pfirsich Eis and Nebel Nr. 2. Keeping it an explicit field was correct.

---

# Phase 3 — Make the look changeable

`design/beta/style.css` is 795 lines. It is well organised already, with numbered German section comments. This phase splits it along seams that are already there.

## - [ ] T3.1 — Extract `tokens.css`

**What.** `src/css/tokens.css` — every colour, font, size, radius and spacing value.

**Why.** This is the "UI must be easy to change" requirement, concretely. One file, opened once, restyles the entire site. Everything else references it and nothing else hard-codes a value.

**How.** Start from the existing `:root` block, which already holds most of this. Add a short comment to each token saying where it shows up, because `--bg-line` means nothing on its own but "borders, dividers, card outlines" is actionable.

Then grep the remaining CSS for hex codes, `px` font sizes and hardcoded font names, and pull anything that is a design decision up into a token. Not every number — a `1.5px` burger bar thickness is an implementation detail, not a design token. The test is whether someone restyling the site would want to change it.

**Done when.** Changing `--purple` visibly changes the whole site with no stragglers.

> **Updates**
> _none_

---

## - [ ] T3.2 — Extract `base.css`

**What.** Reset, typography, focus rings, skip link, and the layout utilities.

**Why.** Separating "how the site behaves as a document" from "what the components look like" means you can find things. These rules are the ones you almost never touch.

**How.** Sections 2 and 3 of the original stylesheet: the box-sizing reset, `body`, headings, links, `:focus-visible`, `.skip`, `.wrap`, `.section`, `.section-line`, `.label`, `.lead`, and the `.h-xl` / `.h-lg` / `.h-md` scale.

Keep the `:focus-visible` rule exactly as written. It is the site's only keyboard affordance and it is currently correct.

**Done when.** The file exists and nothing visual changed.

> **Updates**
> _none_

---

## - [ ] T3.3 — Extract `components.css`

**What.** Buttons, header, nav, burger, cards, forms, menu rows, hours rows, social list, map.

**Why.** The file you open to change what a specific thing looks like. Largest of the four, which is correct — it is where the actual design lives.

**How.** Sections 4, 7, 8b, 8c, 8d and 8e of the original. Keep the German section comments; they are good and someone wrote them for a reason.

Watch the media queries. The `@media (min-width: 860px)` block redefines nav layout and also `--pad`. Moving a rule out of a media query silently breaks the responsive behaviour, and it will not be obvious at desktop width.

**Done when.** All five pages render unchanged at 375px, 860px and 1400px.

> **Updates**
> _none_

---

## - [ ] T3.4 — Extract `effects.css`

**What.** Smoke animation, marquee, reveal transitions, and the reduced-motion block.

**Why.** All the motion in one file. It is the first thing to look at when something animates badly, and the reduced-motion overrides need to sit next to what they override or they get forgotten.

**How.** Sections 5, 6 and 9 of the original, plus the `@keyframes` for `drift-a`, `drift-b`, `drift-c` and `marquee`.

The `@media (prefers-reduced-motion: reduce)` block must be **last in load order across all four files**, since it uses plain specificity plus `!important` on two rules to win. Link `effects.css` last in the layout.

**Done when.** Enabling reduce-motion at OS level stops smoke, marquee and reveal.

> **Updates**
> _none_

---

## - [ ] T3.5 — Fold in the inline styles

**What.** Remove the `style="..."` attributes scattered through the prototype's markup.

**Why.** There are a handful — `style="margin-top: 18px"` on paragraphs, and a colour override on the CTA heading's `<em>`. Inline styles beat any stylesheet rule, so they are invisible overrides that defeat the token file. If the point of Phase 3 is that `tokens.css` controls the look, these undermine it.

**How.** Grep `src/` for `style="`. For each, either add a small utility class in `base.css` such as a stack-spacing helper, or fold it into the existing component rule. The CTA `<em>` colour override becomes part of the `.cta` heading rule in `components.css`.

**Done when.** `grep -r 'style="' src/` returns nothing.

> **Updates**
> _none_

---

# Phase 4 — Real form, real fallbacks

## - [ ] T4.1 — Make the enquiry form actually submit

**What.** A real `method="POST"` form on the Privatfeiern page.

**Why.** Right now `main.js` calls `preventDefault()`, hides the form and shows a confirmation message. Nothing is sent anywhere. A customer fills in their birthday party details, sees "thank you", and the lounge never hears from them. It is the most damaging bug on the site precisely because it looks like it works.

**How.**

```njk
<form class="form" id="anfrage" method="POST" action="{{ site.formAction }}">
```

Hosting is not yet decided, so `site.formAction` is the one value that changes later:

| Host | Value |
| --- | --- |
| Netlify | empty, plus `data-netlify="true"` on the form |
| Formspree / Basin | the provider endpoint URL |
| German shared host | `/kontakt.php` |

Add a honeypot: a text input named `bot-field`, hidden via CSS, with `tabindex="-1"` and `autocomplete="off"`. Submissions that fill it are bots. This is the cheapest spam defence there is and it costs one field.

Drop `novalidate` so the browser validates natively when JS is off.

**Done when.** With JS disabled, submitting posts to the configured action and the browser enforces required fields.

> **Updates**
> _none_

---

## - [ ] T4.2 — Turn the JS into progressive enhancement

**What.** Rewrite the form handler in `main.js` to enhance rather than replace.

**Why.** The current handler is the only thing standing between the user and a working form. Enhancement means the form works without JS and works *better* with it.

**How.** Keep `preventDefault`, but actually send via `fetch` to the form's own action, then show the existing `#anfrage-ok` block on success. On network failure, do not swallow it — show an error and the phone number, since someone trying to book a party needs a way through.

Keep the existing focus management. The current code sets `tabindex="-1"` and focuses the confirmation, which is correct for screen readers and should survive the rewrite.

Everything else in `main.js` — burger menu, scroll header, reveal observer, today highlighting — is fine and stays as it is. It is 101 lines of clear vanilla JS with German comments. Do not modernise it for its own sake.

**Done when.** Submitting with JS on shows the inline confirmation and the data actually arrives.

> **Updates**
> _none_

---

## - [ ] T4.3 — Fix the reveal-without-JS failure

**What.** Gate the `.reveal` opacity rule behind a `js` class on `<html>`.

**Why.** A real bug in the current CSS. `.reveal { opacity: 0 }` is unconditional, and `main.js` is what adds `.is-in` to undo it. If the script fails to load — blocked, network error, JS off — most of the content on every page is permanently invisible. The site looks broken rather than degraded. This is worth fixing regardless of how rare it is, because the failure is total and silent.

**How.** One line in the `<head>`, before any stylesheet:

```html
<script>document.documentElement.className += " js";</script>
```

Then in `effects.css`:

```css
html.js .reveal { opacity: 0; transform: translateY(26px); }
```

The `.is-in` and reduced-motion rules stay as they are. Without JS, `.reveal` never gets `opacity: 0`, so content is simply visible with no animation. That is the correct fallback.

**Done when.** With JS disabled in devtools, every page is fully readable.

> **Updates**
> _none_

---

# Phase 5 — Production basics

## - [ ] T5.1 — Self-host the fonts

**What.** Serve Bodoni Moda and Manrope from `src/fonts/` instead of Google's CDN.

**Why.** Three reasons, in order. It removes a render-blocking external stylesheet and two preconnects from every page load. It removes a third-party dependency the site cannot function without. And it sidesteps the German Google Fonts question entirely rather than leaving it as a thing to worry about later, which matters even for a portfolio piece since anyone reviewing the code will notice.

**How.** Download the woff2 files for the weights actually used — Manrope 400/500/600, Bodoni Moda 400 and 400 italic. Do not grab the whole family. Subset to latin and latin-ext, since the content is German and needs umlauts and ß.

Declare `@font-face` in `tokens.css` with `font-display: swap`. Remove the three `<link>` tags from the layout head.

**Done when.** Devtools Network shows zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`, and both typefaces still render.

> **Updates**
> _none_

---

## - [ ] T5.2 — Add structured data

**What.** A `BarOrPub` JSON-LD block in the layout head.

**Why.** This is how Google gets the address, phone and opening hours for the local business panel. For a lounge, the most common search is someone checking whether it is open right now. Generating it from `site.yaml` and `hours.yaml` means it cannot drift from what the page displays, which is the usual failure with hand-written structured data.

**How.** In a partial, loop `hours.yaml` for `openingHoursSpecification`, skipping rows without a `schema` block. Pull name, address, phone and URL from `site.yaml`.

Note the Freitag/Samstag row closes at 03:00, which is *after* midnight. Schema.org handles this correctly with `closes: "03:00"` — do not try to be clever and write 27:00.

**Done when.** Google's Rich Results Test parses it with no errors.

> **Updates**
> _none_

---

## - [ ] T5.3 — Legal page stubs and real footer links

**What.** `impressum.njk` and `datenschutz.njk`, and turn the footer text into links.

**Why.** The footer currently reads "Impressum · Datenschutz" as plain text on all five pages. It looks like navigation and does nothing. Since this is a portfolio piece rather than a live business, the pages are honest placeholders — but the structure, routing and footer links should be real, because that is the part being demonstrated.

**How.** Both pages use `page.njk` so they get normal chrome. Fill with clearly marked placeholder text: a visible note that this is demo content and the real text must be written before going live. Do not write plausible-looking fake legal text — someone will eventually ship it.

Update the footer partial to link both. Note: this changes the footer, which means it no longer matches the T1.9 diff baseline. That is expected and correct.

**Done when.** Both pages build and the footer links reach them from every page.

> **Updates**
> _none_

---

## - [ ] T5.4 — Favicon and social preview image

**What.** A favicon set and one Open Graph image.

**Why.** The layout already emits `og:title` and `og:description` but no `og:image`, so any share on WhatsApp or Instagram renders as a bare grey box. For a lounge, WhatsApp is where the link actually gets shared — the site already has WhatsApp buttons on every page.

**How.** An SVG favicon plus a 180px PNG for Apple touch. The brand mark is `Nebel` with a coloured full stop, which reproduces fine at 16px.

For `og:image`, a 1200×630 image. Since the site has no photography yet, a typographic card using the brand colours works and is consistent with the design's fully typographic approach. Revisit after T6.1.

**Done when.** The tab shows an icon, and a share preview renders an image.

> **Updates**
> _none_

---

## - [ ] T5.5 — Sitemap, robots.txt and canonicals

**What.** `sitemap.njk` generating `sitemap.xml`, a `robots.txt`, and a canonical link tag.

**Why.** Standard, small, and each does one job. The sitemap generated from Eleventy's collection cannot go stale when a page is added, which is the whole reason to generate rather than write it.

**How.** Loop `collections.all` for the sitemap, skipping the 404 page. `robots.txt` allows everything and points at the sitemap. Canonical goes in the layout head, built from `site.url` and `page.url`.

**Done when.** `_site/sitemap.xml` lists every real page and `_site/robots.txt` exists.

> **Updates**
> _none_

---

## - [ ] T5.6 — Add a 404 page

**What.** `404.njk` with normal site chrome.

**Why.** A default host 404 drops the visitor out of the site entirely. With the header and footer present, a mistyped URL still leads to the menu and the phone number.

**How.** Use `page.njk` with a short German hero and buttons to the homepage, the menu and the phone number. Set `permalink: /404.html`.

**Done when.** Visiting a nonexistent path during `npm start` renders the styled page.

> **Updates**
> _none_

---

# Phase 6 — Images and map

## - [ ] T6.1 — Add photography

**What.** Three to six real photographs.

**Why.** Verified during review: the prototype contains **zero image files**. Every visual is CSS — the smoke is blurred radial gradients, the map is a repeating-linear-gradient grid. The typographic design is genuinely strong, but a lounge sells atmosphere, and nobody books a table without seeing the room. This is the largest remaining gap.

**How.** The room, a prepared head, and the terrace at minimum. Serve through `<picture>` with AVIF and WebP sources and a JPEG fallback.

Every image needs `loading="lazy"`, `decoding="async"`, and explicit `width` and `height` attributes. Without the dimensions the page reflows as images load, which is both ugly and a Lighthouse penalty.

German `alt` text describing the room, not the photo. Skip `alt` only if an image is genuinely decorative, in which case `alt=""`.

Keep the count low. The design's restraint is why it works, and filling it with stock photography would make it worse.

**Done when.** Images render, Lighthouse reports no layout shift, and all have alt text.

> **Updates**
> _none_

---

## - [ ] T6.2 — Replace the map placeholder

**What.** Swap the CSS-grid map on the contact page for a static map image linking to Google Maps.

**Why.** The prototype's own German note says to do this — it tells the reader to replace the `.map` block with their map service's iframe. A static image is the better call than an iframe: it loads instantly, embeds no third-party tracker, and nobody pans around an embedded map on a contact page. They tap it to get directions.

**How.** Export a static map at the lounge coordinates, styled dark to match. Wrap in the existing `<a>` to `site.maps` so tapping still opens directions. Keep the `.map` class so the existing border, radius and aspect-ratio rules apply unchanged.

Remove the German placeholder note underneath it.

**Done when.** The contact page shows a real map and tapping opens Google Maps.

> **Updates**
> _none_

---

# Phase 7 — CMS (optional)

Last on purpose. It is the one piece that edges toward overengineering, and everything above works without it. Do not start this phase until Phases 0–6 are ticked.

## - [ ] T7.1 — Add Sveltia CMS

**What.** `src/admin/index.html` and `src/admin/config.yml`.

**Why.** The owner is non-technical and needs to change prices without touching the repository. Phase 2 already did the hard part by putting content in YAML; this is just an editing surface on top.

Sveltia rather than Decap: it reads the same config format so the two are swappable, it is a single script tag with no npm dependency, and it does not depend on the deprecated Netlify Identity backend.

**How.** `index.html` is a script tag and a mount point. `config.yml` describes three collections mapping to the Phase 2 data files:

- **Karte** — groups with name, hint, teaser, and a nested item list of name, price, note, flag
- **Öffnungszeiten** — label, time, days
- **Kontaktdaten** — the `site.yaml` fields

Label everything in German. The person using this does not read `postalCode`.

Do not expose the `schema` block in `hours.yaml` to the CMS. It is machine data, and surfacing it invites someone to break the structured data while trying to edit opening times.

**Done when.** `/admin/` loads and shows the three collections with current content.

> **Updates**
> _none_

---

## - [ ] T7.2 — Wire up CMS authentication

**What.** GitHub OAuth so the owner can log in and save.

**Why.** Without it the CMS reads but cannot write, which makes it a viewer rather than a CMS.

**How.** Depends on where the site ends up hosted, which is why this is the last task in the build. On Netlify or Cloudflare Pages, a GitHub OAuth app plus the auth worker Sveltia documents. Saving commits to the repo and triggers a rebuild.

Write the actual steps into this task's Updates block once hosting is chosen, since the plan cannot specify them in advance.

**Done when.** The owner logs in, changes a price, and the live site shows it after the rebuild.

> **Updates**
> _none_

---

# Phase 8 — Final verification

Run all six before calling the project done. Each targets a specific way this build could have gone wrong.

## - [ ] T8.1 — Token change propagates

**What.** Change `--purple` in `tokens.css` to something loud. Confirm it changes everywhere. Revert.

**Why.** This is the headline requirement — the UI must be easy to change. A leftover hardcoded hex would only show up as one element staying the old colour, which is exactly what this test catches. Then revert; this is a probe, not a change.

**Done when.** Every purple element changed, and the revert is clean.

> **Updates**
> _none_

---

## - [ ] T8.2 — Content change propagates

**What.** Change the phone number in `site.yaml`. Confirm all former occurrences update.

**Why.** It appeared 23 times in the prototype. If any survived the Phase 2 migration, this finds it. Check the `tel:` links, the WhatsApp URLs, the footer, and the structured data — not just the visible text.

**Done when.** No instance of the old number remains in `_site/`. Revert after.

> **Updates**
> _none_

---

## - [ ] T8.3 — Keyboard-only pass

**What.** Navigate every page using only the keyboard.

**Why.** The prototype got this right and the port must not lose it. Tab from the top: the skip link should appear first, focus rings must be visible on every interactive element, the burger must open and close on Enter, Escape must close it and return focus to the button.

**Done when.** All five pages are fully operable without a mouse.

> **Updates**
> _none_

---

## - [ ] T8.4 — Reduced motion

**What.** Enable reduce-motion at OS level and reload.

**Why.** The prototype has a complete reduced-motion block covering smoke, marquee, reveal, header transitions and smooth scrolling. Splitting the CSS in Phase 3 could easily have broken the cascade order that makes it work.

**Done when.** Nothing animates, and all content is still visible.

> **Updates**
> _none_

---

## - [ ] T8.5 — No JavaScript

**What.** Disable JS entirely and walk the site.

**Why.** Verifies T4.3 fixed the invisible-content bug and T4.1 left a working form. Content readable, nav usable, form submits.

**Done when.** Every page is fully readable and the form posts.

> **Updates**
> _none_

---

## - [ ] T8.6 — Validate and measure

**What.** W3C HTML validator on all five pages, then Lighthouse.

**Why.** Catches the small structural mistakes that porting introduces — an unclosed tag, a duplicate ID from a partial included twice.

With no framework, self-hosted fonts, lazy images and the accessibility work already in place, accessibility and best-practices should both land at or near 100. Anything materially lower means something regressed during the port rather than being a target to chase.

Finally, confirm `_site/` contains nothing but static HTML, CSS, JS, fonts and images.

**Done when.** Validator is clean and Lighthouse scores are recorded in Updates below.

> **Updates**
> _none_

---

## Out of scope

Recorded so they are decisions rather than oversights. Each is a real choice to make later, not something to build speculatively now.

- Online booking or table management — the phone and WhatsApp flow is what a lounge this size actually uses
- Menu ordering or payment
- Multi-language — the audience is local and German
- Analytics — adds a consent banner, which is a real cost for a demo
- Drafted German legal text — T5.3 ships honest stubs instead
