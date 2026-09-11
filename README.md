# Nebel Lounge

Website for a shisha lounge in Stuttgart. Five pages, German, built with
[Eleventy](https://www.11ty.dev/) into plain static HTML.

Live: https://nebel-lounge.netlify.app/

## Run it

```sh
npm install
npm start          # http://localhost:8080, rebuilds as you save
```

```sh
npm run build      # static output into _site/
npm test           # build, then run the checks
```

## Editing content

Nothing that changes on the site lives in the markup. It is all in
`src/_data/`:

| File | What it controls |
| --- | --- |
| `site.yaml` | Address, phone, WhatsApp, email, Instagram |
| `menu.yaml` | All 24 items, prices, descriptions, the homepage teaser |
| `hours.yaml` | Opening times |
| `bilder.yaml` | The three photos, their alt text and captions |
| `nav.yaml` | Navigation, used by both header and footer |

Edit a file, save, done. One change propagates everywhere it appears,
including the structured data search engines read.

The lounge owner does the same thing through a visual editor at `/admin/`,
with German labels and no files involved.

**Two traps.** Quote every price, or YAML mangles `5,50 €`. And edit files in
`src/`, never in `_site/` — that folder is generated and gets overwritten on
every build.

## Changing the design

`src/css/tokens.css` holds every colour, font and size. Change it there and
the whole site follows. The other three files are ordered and must stay that
way, because `effects.css` carries the reduced-motion rules that need to win:

```
tokens.css       colours, fonts, sizes      <- start here
base.css         reset, typography, focus
components.css   buttons, nav, cards, menu
effects.css      smoke, marquee, animation  <- must load last
```

No hardcoded colours outside `tokens.css`, and no `style=""` in the markup.
`npm run check` enforces both.

## Deploying

Push to `main`. Netlify builds and publishes automatically, using
`netlify.toml`.

The enquiry form on the Privatfeiern page is handled by Netlify Forms, so
there is no backend. Submissions appear in the Netlify dashboard.

## Checks

`npm run check` runs eleven checks in about a second — dead links, duplicate
IDs, unresolved CSS variables, missing alt text, invalid structured data, and
whether the CMS still knows about every field in the data files.

It ends with a list of things still to do before going live. That list is
currently three items long.

## Still to do

- Replace the placeholder images in `src/img/` with real photographs
- Convert `src/img/og-image.svg` to PNG and add the `og:image` tag
- Write the real Impressum and Datenschutz text
- Finish the CMS login (GitHub OAuth app in Netlify settings)
- Keyboard accessibility pass

`TASKS.md` has the full history: 46 tasks, what was done, and what each open
one is waiting on.

## Layout

```
src/_data/       content (see above)
src/_includes/   layouts and partials — the chrome exists once
src/css/         four stylesheets, load order matters
src/admin/       the CMS
design/beta/     the original prototype, kept as reference, never edited
design/canvas/   dead end from a design tool, ignore
```
