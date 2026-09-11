---
name: verify
description: The checks that prove a phase of the Nebel Lounge build is actually done — whitespace-only diffs against the untouched prototype, the grep checks for leftover hardcoded values, responsive widths, keyboard-only navigation, reduced motion, JavaScript disabled, and the HTML validator. Use before ticking a task, when finishing a phase, when asked whether something works or is done, and before any deploy. Run the checks rather than asserting them — several are mechanical greps whose whole purpose is catching what a visual skim misses.
---

# Verifying the Nebel Lounge build

Most checks here are mechanical. Run them. The reason they exist is that the
failures they catch are invisible to a visual skim — one element keeping an old
colour, one page still carrying a hardcoded phone number, content that vanishes
only when a script fails to load.

Report what the check actually output. If something fails, say so with the output
rather than describing it as mostly working.

## The diff check — the backbone

`design/beta/` is preserved untouched for exactly this. Phases 1 through 3 all
claim to change nothing visible, and this is where that gets proven.

```sh
for p in index karte lounge events kontakt; do
  echo "=== $p ==="
  diff <(sed 's/^[[:space:]]*//;/^$/d' design/beta/$p.html) \
       <(sed 's/^[[:space:]]*//;/^$/d' _site/$p.html)
done
```

Expect no output. Any real difference is a porting mistake — investigate every one
rather than accepting it as noise.

Two expected exceptions, both recorded in their tasks:

- After **T5.3**, the footer gains real Impressum and Datenschutz links
- After **T5.1**, the head loses the three Google Fonts tags

Past those points the diff stops being a clean baseline, which is why the main
checkpoint is T1.9, before either happens.

## Grep checks

Each maps to a specific task's *Done when* and takes a second.

```sh
grep -rn "4971112345678" src/        # T2.1 — only site.yaml may match
grep -rn 'style="' src/              # T3.5 — must be empty
grep -rn "Tübinger" src/             # T2.1 — only site.yaml may match
grep -rniE "#[0-9a-f]{3,6}" src/css/components.css src/css/base.css
                                     # T3.1 — must be empty, colours live in tokens
```

## Responsive

Three widths, every page. The site has one real breakpoint at 860px where the nav
switches from burger to inline and `--pad` changes.

| Width | Checking |
| --- | --- |
| 375px | burger menu, stacked grids, no horizontal scroll |
| 860px | the breakpoint itself, nav switch |
| 1400px | max-width container, two-column grids |

Horizontal scroll at 375px is the common failure. `body` has `overflow-x: hidden`
which hides the symptom, so check that content is not actually cut off rather than
trusting that no scrollbar appears.

## Keyboard only

The prototype got this right. The port must not lose it.

1. Load a page, press Tab once. The skip link must appear.
2. Tab through. Every interactive element shows a visible brass focus ring.
3. At mobile width, open the burger with Enter. It opens.
4. Press Escape. It closes **and focus returns to the burger button**.
5. Tab to the current page's nav link. It carries `aria-current="page"`.

## Reduced motion

Enable reduce-motion at OS level, reload, and confirm smoke, marquee, reveal,
header transitions and smooth scrolling have all stopped.

Splitting the CSS in Phase 3 is the likely way to break this, because the
reduced-motion block wins partly on cascade order. If motion persists, check that
`effects.css` is linked last.

All content must still be visible. Motion off must never mean content hidden.

## JavaScript disabled

Disable JS in devtools and walk all five pages.

- **All content visible.** This is the T4.3 regression check. `.reveal` sets
  `opacity: 0` and only `html.js` should gate it. If content is invisible, the fix
  did not take and the site is broken for anyone whose script fails to load.
- Nav is usable — the burger will not work, which is acceptable, but the links must
  be reachable.
- The enquiry form submits and the browser enforces required fields natively.

## Content integrity

After Phase 2, the menu moved from hand-written markup into YAML. That was
transcription, and transcription is where silent errors live.

Check every item name, price, note and `Haus` flag against
`design/beta/karte.html` character by character. There are around 20 items. A
wrong price on a live menu is a real problem, not a cosmetic one.

Also confirm today's row still highlights in the opening hours, on both the
homepage and the contact page.

## Propagation checks

These prove the actual point of the project — that the site is easy to change.

**Tokens.** Change `--purple` in `tokens.css` to something loud. Every purple
element must change. A leftover hardcoded hex shows up as one element staying the
old colour. Revert afterwards; this is a probe, not a change.

**Data.** Change the phone number in `site.yaml`. It appeared 23 times in the
prototype, so check `tel:` links, WhatsApp URLs, the footer, and the structured
data, not just visible text. Revert afterwards.

## Validate and measure

W3C HTML validator on all five pages. Porting introduces exactly the mistakes it
catches: an unclosed tag, or a duplicate ID from a partial included twice on one
page.

Then Lighthouse. With no framework, self-hosted fonts, lazy images and the
accessibility work already present, accessibility and best-practices should land
at or near 100. Materially lower means something regressed during the port. Record
the scores in T8.6's Updates block.

Finally, confirm the build is what it claims to be:

```sh
find _site -type f | sed 's/.*\.//' | sort -u
```

Only `html`, `css`, `js`, `woff2`, image extensions, `xml` and `txt`.
