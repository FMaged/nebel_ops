---
name: tasks
description: The TASKS.md protocol for the Nebel Lounge project — task bodies are immutable, progress is recorded by ticking the checkbox and appending a dated line to that task's Updates block, and the progress table is kept in sync. Use whenever finishing or starting a task, marking something complete or done, recording that an approach changed, adding a new task, or editing TASKS.md for any reason. Apply it even for a one-word change — rewriting a task body to match what actually happened is exactly the mistake this prevents.
---

# TASKS.md protocol

[TASKS.md](../../../TASKS.md) is the build plan and the record of what was agreed.
Its value comes from being append-only. A plan that gets quietly rewritten to match
what happened is not a record, it is a rationalisation.

## The one rule

**Task bodies are immutable.** Once written, the *What*, *Why*, *How* and
*Done when* of a task are never edited, reworded, corrected or deleted. Not to fix
a typo, not to reflect a better approach, not because the task turned out wrong.

Two operations are permitted, and nothing else.

## 1. Ticking a task

When *Done when* is satisfied, change `- [ ]` to `- [x]` on that task's heading.

Only when it is actually satisfied. If a task is 90% done, it stays unticked. A
half-ticked plan is worse than an honest one because it removes the signal that
work remains.

Then update the count in the **Progress** table at the top of the file. That table
is the only place in TASKS.md that is meant to change without an Updates entry.

## 2. Appending an update

When reality differs from what the task says, append a dated line to that task's
Updates block. Replace the `_none_` placeholder on the first entry.

```markdown
> **Updates**
> - 2026-09-12 — Used Basin, not Formspree. Free tier covers 100 submissions/mo.
```

Write an update when any of these happen:

- A different tool, library or approach was used than the task describes
- Something in the *How* turned out to be wrong or impossible
- The task was skipped, and why
- A measurement the task asked for — Lighthouse scores in T8.6, for example
- A decision the task deferred was made, such as the hosting choice in T7.2

Keep it to a line or two. State what changed, not a narrative of the attempt.

## When a task is wrong

Do not delete it and do not fix its text. Choose one:

- **Still valid, different execution** — tick it, record the difference in Updates.
- **No longer needed** — tick it, and record in Updates that it was dropped and why.
- **Needs replacing** — leave it, record in Updates that it is superseded, and add a
  new task below it with the next free number in that phase.

## Adding tasks

New tasks take the next free number in their phase and are **appended to the end of
that phase**, never inserted between existing ones. Renumbering breaks every
reference anyone has written down or remembered.

A new task carries the same four sections as the others: What, Why, How, Done when,
plus an empty Updates block. The *Why* is not optional — every task in the file
justifies itself against something concrete about this codebase, and a new one
without that reasoning is a guess.

Update the Progress table's task count for that phase.

## Phases are ordered

Phases run in order. Phase 1 removes duplication that every later phase depends on
being gone. Phase 3 splits CSS that Phase 2 must have finished touching. Phase 7 is
explicitly gated on Phases 0–6 being ticked.

Tasks within a phase can be reordered where they are genuinely independent, but say
so rather than doing it silently.

## Before reporting work complete

Check the Done when line and confirm it literally. Several are mechanical and
verifiable rather than a matter of judgement:

- T2.1 — `grep -r "4971112345678" src/` returns only `site.yaml`
- T3.5 — `grep -r 'style="' src/` returns nothing
- T1.9 — all five diffs against `design/beta/` are whitespace-only

Run the check. Do not assert it.
