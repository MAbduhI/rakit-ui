# P4 — Organism, Template, and Page tiers

Closes **M4** in [PHASE.md](PHASE.md). Target version `0.4.0`. Follows [M3_Plan.md](M3_Plan.md).

This is where the library stops being a collection of styled elements and starts being something you can build an application shell out of. It is also the hardest phase: organisms own state, manage focus, escape their DOM position through portals, and are where accessibility bugs actually live.

## Goal

Ship the stateful, composite components an app cannot avoid — dialog, menu, table, navigation — plus the layout templates that assemble them, so a consumer can stand up a working dashboard without writing a single primitive.

---

## Decision gate — settle this before writing any component

**Do we build focus management ourselves, or adopt a headless primitive library?**

Every organism in this phase needs some combination of: focus trapping, focus restoration, portals, outside-click and Escape dismissal, scroll locking, collision-aware positioning, roving tabindex, and typeahead. Today the package has exactly three runtime dependencies — `class-variance-authority`, `clsx`, `tailwind-merge` — and no primitive dependency at all.

| Option                                        | Gains                                                                               | Costs                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Build in-house**                            | Zero new dependencies; full control of DOM and API                                  | Focus trapping and collision positioning are genuinely hard; a11y bugs will ship; large ongoing maintenance |
| **Radix Primitives** (`radix-ui`)             | Battle-tested a11y, composable, unstyled, matches the token approach                | A real peer/runtime dependency; its composition model shapes our public API                                 |
| **React Aria Components**                     | Strongest a11y and i18n story                                                       | Heavier; more opinionated about structure and styling hooks                                                 |
| **Hybrid** — build the simple, adopt the hard | Keeps `Tabs`/`Accordion` dependency-free; buys correctness for dialog/menu/combobox | Two mental models in one library; the boundary needs to be written down and defended                        |

**Recommendation: adopt Radix Primitives**, per component, only where focus or positioning is involved. Hand-rolling a correct focus trap and collision-aware popover is months of work that is not this project's differentiator — the differentiator is the token system and the theming contract, and those stay entirely ours either way.

Whatever is chosen, it must be decided **before item 1**, recorded in `docs/`, and reflected in `package.json` (a primitive library belongs in `dependencies`, not `peerDependencies`, unless consumers are expected to interact with it directly).

**Also settle here:** whether components that use hooks get a `"use client"` directive. Next.js App Router consumers hit this immediately, and adding directives later is a mechanical but wide change. It affects `useTheme` today already.

---

## Scope

### Organisms

Ordered so that the shared primitives — portal, dismissal, focus — get built or wired once, in item 1, and reused.

| #   | Component      | Folder                           | Hard parts                                                                            |
| --- | -------------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | `Dialog`       | `src/components/Organism/dialog` | Focus trap + restore, scroll lock, Escape, `aria-modal`, portal. Sets the pattern.    |
| 2   | `Popover`      | `.../popover`                    | Collision-aware positioning, outside-click dismissal, anchor tracking on scroll.      |
| 3   | `DropdownMenu` | `.../dropdown-menu`              | Roving focus, typeahead, submenus, `menuitem` roles. Builds on `Popover`.             |
| 4   | `Combobox`     | `.../combobox`                   | `aria-activedescendant`, filtering, async options. The hardest single component.      |
| 5   | `Toast`        | `.../toast`                      | Region + provider + imperative API, `aria-live`, timers, stacking, motion-reduce.     |
| 6   | `DataTable`    | `.../data-table`                 | Sorting, sticky header, zebra via `surface-alt`, responsive overflow, empty state.    |
| 7   | `Navbar`       | `.../navbar`                     | Responsive collapse, active state, theme toggle slot.                                 |
| 8   | `Sidebar`      | `.../sidebar`                    | Collapsible, nested nav, mobile drawer (reuses `Dialog`'s focus behavior).            |
| 9   | `Form`         | `.../form`                       | Submission state, error summary, focus-first-error. No validation library dependency. |
| 10  | `EmptyState`   | `.../empty-state`                | Simple, but the one every app hand-rolls. Cheap win.                                  |

### Templates

Slots only. No content, no data fetching, no routing — a template renders `children` into named regions and nothing else.

| Component          | Regions                                        |
| ------------------ | ---------------------------------------------- |
| `DashboardShell`   | navbar, sidebar, main, optional right rail     |
| `AuthLayout`       | centered card, brand slot, footer              |
| `SettingsLayout`   | section nav + content pane                     |
| `ListDetailLayout` | master list + detail pane, responsive stacking |

The existing `useTheme` hook already lives beside this tier's concerns — the shells are the natural home for the theme toggle placement convention.

### Pages

Story-only compositions under `Components/Page/…`. Their job is to prove the tiers actually compose and to give the showcase something realistic: a dashboard, a settings screen, a sign-in screen, an empty/loading state.

---

## Cross-cutting work

**Portals and theming.** A portalled dialog renders outside the app root. Theming survives because `data-theme` lives on `<html>` and the tokens are on `:root` — but this must be verified early, in item 1, in both themes. It is the most likely place the theming contract quietly breaks.

**Motion.** Nothing in the library animates yet. Dialog, popover, and toast all want enter/exit transitions, and all need a `prefers-reduced-motion` path. Decide whether motion tokens (duration, easing) join the `@theme` block — they probably should, for the same reason colors did.

**Tokens likely needed.** Overlay/scrim, elevated surface for floating panels, shadow tokens (there are none today — floating panels need depth that a border alone cannot convey). Each through the `add-token` skill.

**Testing.** jsdom does not lay out, so positioning cannot be asserted. Test what jsdom can see — focus movement, ARIA wiring, keyboard sequences, dismissal — and verify positioning by hand in the playground. If coverage here proves inadequate, evaluate Playwright, but do not add it speculatively.

**SSR.** Any component reading `window` or `document` at module scope breaks SSR. `themeScript` already exists for this reason; organisms need the same discipline.

---

## Exit criteria

- [ ] Primitive-library decision made, documented, and reflected in `package.json`.
- [ ] All ten organisms shipped with the six edits from the `new-component` skill.
- [ ] All four templates shipped, slots only.
- [ ] Page-level compositions exist as stories and render correctly in both themes.
- [ ] Every interactive organism is fully keyboard-operable and verified with a screen reader.
- [ ] Focus trap, restore, Escape, and outside-click behave consistently across dialog, popover, menu, and combobox.
- [ ] Portalled content themes correctly in both light and dark.
- [ ] Every animation has a `prefers-reduced-motion` path.
- [ ] New tokens in all three CSS blocks and documented in `docs/theming.mdx` with measured contrast.
- [ ] `pnpm check:full && pnpm typecheck && pnpm test && pnpm build` green.
- [ ] `0.4.0` published.

## Risks

| Risk                                                                               | Mitigation                                                                                               |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| The primitive-library decision gets deferred and half the phase is built both ways | Hard gate. Nothing in this phase starts until it is written down.                                        |
| Hand-rolled focus management ships subtly broken and nothing catches it            | This is the main argument for adopting primitives. If building in-house, budget real screen-reader time. |
| `Combobox` consumes the phase                                                      | Sequence it after `Popover` and `DropdownMenu` so it inherits both. Cut it to `0.5.0` if it stalls.      |
| Portalled content loses theming and is found late                                  | Verify in item 1, in both themes, before nine more components inherit the bug.                           |
| Templates accrete opinions — routing, data fetching, auth                          | Slots only. A template that imports anything beyond React and Rakit components has gone wrong.           |
| Bundle size grows quietly                                                          | Establish the per-entry budget here rather than discovering it in P5.                                    |
| jsdom hides layout bugs                                                            | Hand-verify positioning in the playground on every popover-family component.                             |
