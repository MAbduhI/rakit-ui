# AGENT.md — orchestrator contract

How an orchestrating agent decomposes work in this repo and hands it to sub-agents.

`CLAUDE.md` is the standing rulebook — conventions, layout, commands — and applies to every agent, orchestrator and sub-agent alike. This file covers only the part `CLAUDE.md` does not: **who does what when work is split across agents.**

The orchestrator plans, delegates, and integrates. It does not do the implementation itself when the work can be parallelized cleanly.

---

## When to orchestrate at all

Delegation costs a round trip and a context hand-off. It pays for itself only when the work is genuinely wide.

| Situation                                                          | Do this                                          |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| One component, one token, one bug fix                              | Do it inline. Do not delegate.                   |
| "Where is X?" across an unfamiliar area                            | One `Explore` agent                              |
| 3+ independent components from the same milestone                  | One implementer agent per component, in parallel |
| A change touching every component (ref forwarding, `"use client"`) | Fan out by component, then one integrator        |
| A whole milestone from [PHASE.md](PHASE.md)                        | Plan → fan out → verify → integrate              |

The honest test: if two sub-agents would need to edit the same file, they are not independent, and splitting them creates a merge problem the orchestrator has to solve by hand.

---

## Roles

**Orchestrator.** Reads the milestone plan, resolves open decisions _before_ fanning out, defines each unit of work, dispatches, integrates results, and runs the final gate. Owns everything shared: `src/index.ts`, `src/styles.css`, `showcase.tsx`, `docs/theming.mdx`.

**Scout** (`Explore`). Read-only. Answers "where does X live", "what is the existing pattern for Y", "is Z already implemented". Returns findings, never edits.

**Planner** (`Plan`). Turns a phase or milestone into ordered, dependency-aware units. Use when sequencing is unclear; skip it when [M3_Plan.md](M3_Plan.md) or [P4_Plan.md](P4_Plan.md) already answers the question.

**Implementer** (`general-purpose`). Owns exactly one component folder end to end. Follows the `new-component` skill. Never touches another agent's folder.

**Reviewer.** Checks a completed unit against the conventions below. Most valuable on the shared-file integration step, where the six-edit checklist is easiest to half-finish.

---

## The parallelization boundary

Everything in this repo splits cleanly along one line: **a component folder is private to one agent; everything else is shared and belongs to the orchestrator.**

```
packages/ui/src/components/<Tier>/<name>/     ← one agent owns this, exclusively
  <name>.tsx  <name>.stories.tsx  <name>.test.tsx  index.ts

packages/ui/src/index.ts          ← orchestrator only, every agent appends to it
packages/ui/src/styles.css        ← orchestrator only, three blocks must stay in sync
packages/ui/docs/theming.mdx      ← orchestrator only
apps/playground/src/showcase.tsx  ← orchestrator only, every agent appends to it
packages/ui/.storybook/*          ← orchestrator only
```

So a fan-out over N components has each implementer produce **four files**, and report back the two lines the orchestrator must add — the `src/index.ts` export and the showcase `<Section>`. The orchestrator applies all of them in one pass. Parallel edits to `src/index.ts` are the single most likely way a fan-out corrupts the tree.

**Tokens are never delegated.** A token means coordinated edits to three CSS blocks plus a documented contrast measurement. Sub-agents that discover a missing color **stop and report it**; they do not add it, and they do not work around it with a hardcoded hex or a `dark:` class. The orchestrator adds the token, then unblocks the agent.

---

## Dispatch contract

Every implementer brief carries all six:

1. **Tier and folder** — `src/components/Molecule/form-field/`, exclusive ownership.
2. **The public API** — the exact props, variants, and defaults, decided by the orchestrator. Sub-agents inventing their own variant vocabulary is how `sm`/`md`/`lg` becomes `small`/`medium`/`large` in one component out of twelve.
3. **Which tokens to use** — named explicitly. If the brief cannot name them, the token is missing; fix that before dispatching.
4. **A reference component** — `Button` for cva + variants, `Card` for multi-part, `Badge` for status tokens. Pointing at existing code beats describing it.
5. **The four files, and only those four.**
6. **What to report back** — the `src/index.ts` export line, the showcase section, any token that was missing, any convention decision that had to be improvised.

Point at the skill rather than restating it: _"Follow the `new-component` skill."_ Everything about cva, `cn()`, token discipline, story titles, and test shape is already there.

---

## Sequencing

Dependencies come from the tiers, and the milestone plans encode them:

- Atoms before molecules. A `FormField` built before `Label` exists gets inline markup that never gets refactored out.
- Shared decisions before fan-out. Ref forwarding, sizing scale, `"use client"`, the P4 primitive-library gate — each one, resolved late, invalidates every component already built.
- Within a milestone, the first item of a family sets the convention. Build `FormField` alone, then fan out the rest of the form molecules against the pattern it established. Same for `Dialog` and the popover family in P4.

A fan-out that starts before its blocking decision is resolved produces N components that all need rework. Resolve first.

---

## Integration

After the fan-out returns, the orchestrator does this in order and does not skip a step because a sub-agent said it was done:

1. Apply every `src/index.ts` export, keeping the file alphabetized by module path.
2. Apply every showcase `<Section>`.
3. Add any token that came back as missing — three CSS blocks, plus `docs/theming.mdx` with measured contrast.
4. Run the `verify` skill: `pnpm check:fix && pnpm typecheck && pnpm test && pnpm build`.
5. Review the showcase in **both** themes. Nothing automated renders dark mode.
6. Check the whole batch for convention drift — variant names, sizing scale, prop naming. Drift is invisible per component and obvious across a batch, and this is the only moment it is cheap to fix.

---

## Invariants

These hold regardless of how work is split. A sub-agent that cannot satisfy one reports back instead of working around it.

- **Tokens only.** No hex, no Tailwind palette classes, no `dark:` — anywhere, ever. Reaching for `dark:` means a token is missing.
- **Six edits per component**, four of them the implementer's, two the orchestrator's. A component missing its `src/index.ts` export builds, typechecks, and tests clean while being invisible to consumers.
- **Never import a component's `.tsx` from outside its folder.** Import the folder.
- **Story `title` decides the sidebar**, not the folder path: `Components/<Tier>/<Name>`.
- **Every change reaches the playground.** Not just new components — a new variant, size, prop, or state needs a case in `apps/playground/src/showcase.tsx` that exercises it. A changed token or base class needs the existing sections re-checked in both themes. The showcase is the only place the whole library renders at once; a change invisible there is a change nobody reviewed.
- **Verify before reporting done.** "Should pass" is not a result. Paste what actually ran.
- **Report honestly.** A skipped step, a failing test, an improvised decision — say so. An orchestrator integrating N optimistic reports produces a broken tree and no idea which agent caused it.

---

## Reference

- [CLAUDE.md](CLAUDE.md) — conventions, layout, commands. Binding on every agent.
- [PHASE.md](PHASE.md) — phases, milestones, current status.
- [M3_Plan.md](M3_Plan.md) · [P4_Plan.md](P4_Plan.md) — milestone scope and exit criteria.
- `.claude/skills/` — `new-component`, `add-token`, `verify`, `release`.
