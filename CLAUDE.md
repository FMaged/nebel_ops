# Nebel Lounge

Static website for a German shisha lounge in Stuttgart. Dark plum and brass,
Bodoni Moda over Manrope, five pages, German throughout.

Being rebuilt from a hand-written prototype into an Eleventy site. The work is
tracked task by task in [TASKS.md](TASKS.md) — read it before starting anything.

## Current state

Phase 0 has not run yet. There is no `src/`, no `package.json`, no build. The
only real content is the prototype in `design/beta/`.

## Layout

```
design/beta/     the prototype — READ-ONLY reference, never edit
design/canvas/   dead end from a design tool, ignore entirely
TASKS.md         the build plan, 43 tasks
src/             the site (created in Phase 0)
_site/           build output, gitignored
```

## Commands

Available once Phase 0 is done:

```sh
npm start     # dev server with live reload
npm run build # static output to _site/
```

## Hard rules

**`design/beta/` is never modified.** It is the reference the built output gets
diffed against, and the only record of the original design. Port from it, never
edit it.

**`design/canvas/` is not part of this project.** Different brand, different
language, a red-on-white design system that contradicts the site. Do not take
anything from it or try to reconcile it.

**Two dependencies, total** — `@11ty/eleventy` and `js-yaml`. A third needs a
recorded reason in the relevant task's Updates block. No React, no Tailwind, no
TypeScript, no CSS preprocessor. Output is static HTML, plain CSS, vanilla JS.

**Content is German.** Page copy, `alt` text, CMS labels, form validation
messages, and the code comments already in `main.js` and `style.css`. Keep them
German when moving code around.

**Accessibility does not regress.** The prototype ships a skip link,
`aria-current`, `aria-expanded`, visible `:focus-visible` rings and a complete
`prefers-reduced-motion` block. Every one survives every refactor.

**Never edit a task body in TASKS.md.** Tick the box, append to Updates. See the
`tasks` skill.

## Skills

- **`tasks`** — the TASKS.md protocol. Use before ticking anything off.
- **`site-conventions`** — how to write pages, layouts, CSS and data here.
- **`verify`** — the checks to run before calling a phase done.
