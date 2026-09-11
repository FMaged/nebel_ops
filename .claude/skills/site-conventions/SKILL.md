---
name: site-conventions
description: How to write code in the Nebel Lounge Eleventy site — flat .html permalinks, layouts and partials instead of duplicated chrome, YAML data files with the German quoting traps (prices like "5,50 €", postcodes), CSS tokens with no hardcoded hex and no inline styles, and the accessibility hooks main.js depends on. Use whenever creating or editing a page, layout, partial, stylesheet, data file or the JavaScript in this project, or when moving content out of the prototype markup. Apply it for small edits too — a single hardcoded colour or an inline style attribute defeats the token file that the whole project is built around.
---

# Nebel Lounge conventions

A five-page static site. Eleventy 3, Nunjucks, plain CSS, vanilla JS. Two
dependencies. Every rule here exists because of something specific in this
codebase, not as general advice.

## Porting from the prototype

`design/beta/` is read-only. Copy out of it, never edit it. It is the baseline
that built output gets diffed against in T1.9.

When porting, change one kind of thing at a time. Moving markup into a layout and
also rewording copy in the same pass makes the diff unreadable and hides mistakes
in the noise.

## Permalinks must stay flat

The prototype links to `karte.html`, not `karte/`. Eleventy defaults to directory
permalinks, which silently breaks every nav and footer link.

```yaml
permalink: /karte.html
```

Set it on every page. This is the single most likely way to break the site.

## Layouts and partials

Chrome exists once. If you find yourself copying a block between two pages, it is
a partial.

- `layouts/base.njk` — doctype, head, header, footer. Homepage uses this directly.
- `layouts/page.njk` — extends base, adds the small hero. All four subpages.
- `partials/` — header, footer, smoke, cta, hours, seo.

The homepage hero is `hero hero-full` with `h-xl`; subpages are `hero hero-small`
with `h-lg`. Do not force the homepage through `page.njk` to save a file.

Hero headings carry intentional `<br>` tags that the design depends on, so they
render through `| safe`. Same for the brand mark, which wraps its full stop in a
span to colour it.

## Data files

Live in `src/_data/` as YAML. Eleventy reads JSON natively but not YAML — the
`addDataExtension` line in `eleventy.config.js` is what makes it work.

**Quote every price.** YAML will mangle `5,50 €` and anything starting with a
digit. Quote the postcode too.

```yaml
price: "14 €"
price: "5,50 €"
postalCode: "70178"
```

**Quote any string containing a colon.** Several menu notes do: `"Unsere Mischung:
Zitrone, Minze, Kaktus."` Unquoted, YAML reads it as a nested key and the build
either fails or silently produces something wrong.

**Nothing is hardcoded twice.** The phone number lives only in `site.yaml`. Before
finishing any task that touches contact details, grep for the literal value.

**Do not derive curated copy.** The homepage menu teaser looks like it could be the
first three items of each group, and for the first group it happens to match. It
does not for the others — the teaser is written copy. It stays an explicit
`teaser` field. This applies generally: if content reads as authored rather than
listed, store it, do not compute it.

## CSS

Four files, linked in this order, and the order matters:

1. `tokens.css` — every colour, font, size, radius, spacing. The file you open to
   restyle the site.
2. `base.css` — reset, typography, focus rings, skip link, `.wrap` `.section`
   `.label` `.lead`, the heading scale.
3. `components.css` — buttons, header, nav, burger, cards, forms, menu rows, hours
   rows, social list, map.
4. `effects.css` — smoke, marquee, reveal, and the reduced-motion block. **Last**,
   because `prefers-reduced-motion` wins on cascade order plus `!important` on two
   rules.

**No hardcoded hex, font name or design value outside `tokens.css`.** The test for
whether a number is a token: would someone restyling the site want to change it? A
brand colour yes; the 1.5px thickness of a burger bar no.

**No `style=""` attributes, ever.** Inline styles beat every stylesheet rule, which
makes them invisible overrides that defeat the token file. If markup needs
spacing, add a utility class in `base.css`.

Keep the German section comments. Someone wrote them deliberately and they are good.

Watch `@media (min-width: 860px)` — it redefines nav layout *and* `--pad`. Pulling
a rule out of it breaks responsive behaviour in a way that is invisible at desktop
width.

## Markup the CSS and JS depend on

Some structure is load-bearing. Changing it breaks things silently.

**`.menu-item` is a CSS grid** placing name, price and note by explicit coordinates.
Reordering those three divs visibly breaks the layout.

**`main.js` reads these and will break without them:**

| Hook | Used for |
| --- | --- |
| `.burger` with `aria-expanded`, `aria-controls`, `aria-label` | mobile menu |
| `.nav` and `.is-open` | mobile menu |
| `.header` and `.is-scrolled` | shrink on scroll |
| `.reveal` and `.is-in` | scroll-in animation |
| `[data-day]` with comma-separated day numbers | today highlighting |

**Decorative markup gets `aria-hidden="true"`.** The smoke divs and the marquee are
both decorative. They are already marked; keep it.

## JavaScript

`main.js` is 101 lines of clear vanilla JS with German comments. It works. Do not
modernise it for its own sake — converting `var` to `const` is not a task.

Everything is progressive enhancement. The site must work with JS disabled: content
readable, nav usable, form submitting. The `html.js` class gates the `.reveal`
opacity rule specifically so that a failed script does not make the page invisible.

## Accessibility

Already correct in the prototype. Preserve, do not reinvent:

- Skip link is the first focusable element on every page
- `:focus-visible` gives a 2px brass outline — never remove it, never replace it
  with `outline: none`
- `aria-current="page"` is derived from `page.url`, not hand-placed
- The reduced-motion block covers smoke, marquee, reveal, header transitions and
  smooth scrolling

## Language

German content, German `alt` text, German CMS labels. `lang="de"` on `<html>`.

Umlauts and ß mean font subsets need latin **and** latin-ext. A latin-only subset
drops characters on a German site.
