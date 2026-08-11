# M3 — Molecule tier

Closes **P3** in [PHASE.md](PHASE.md). Target version `0.3.0`.

A molecule is a small group of atoms that operates as a single control. It composes Rakit atoms, owns at most local UI state, and never traps focus or portals — the moment it needs either, it belongs in the Organism tier ([P4_Plan.md](P4_Plan.md)).

## Goal

Give consumers the compositions they would otherwise rebuild in every app — labelled form fields, alerts, tabs, pagination — so that an application team writes layout, not plumbing.

## Entry criteria

M3 does not start until **M2 is closed**. Molecules composed from atoms that do not exist yet get built with inline markup, and that markup never gets refactored back out. Specifically blocking:

- `Label` — required by `FormField`, which is the anchor of this milestone.
- `Textarea`, `Checkbox`, `Radio`, `Select` — each is a `FormField` control variant.
- `Avatar` — required by `AvatarGroup`.
- The **ref-forwarding decision** from P2. `FormField` wiring labels to controls is the first place it genuinely bites.

## Scope

Ordered by dependency, not by preference. `FormField` first — it establishes the error/description/required conventions that everything else in this milestone follows.

| #   | Component     | Tier folder                          | Composes                     | Notes                                                                                    |
| --- | ------------- | ------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | `FormField`   | `src/components/Molecule/form-field` | Label, Input/Textarea/Select | Owns `id` generation via `useId`, `aria-describedby`, `aria-invalid`, required marker.   |
| 2   | `SearchField` | `.../search-field`                   | Input, Button                | Clear button, `type="search"`, submit on Enter.                                          |
| 3   | `ButtonGroup` | `.../button-group`                   | Button                       | Segmented look — collapses inner radii and borders. Optional single-select state.        |
| 4   | `Alert`       | `.../alert`                          | —                            | `info`/`success`/`warning`/`error` on the status token pairs. Title + description slots. |
| 5   | `Stat`        | `.../stat`                           | Badge                        | Label, value, optional delta. Delta direction uses `success`/`error`.                    |
| 6   | `AvatarGroup` | `.../avatar-group`                   | Avatar                       | Overlap with `max`, then a `+N` overflow chip.                                           |
| 7   | `Breadcrumb`  | `.../breadcrumb`                     | Link, Separator              | `<nav aria-label="Breadcrumb">`, `aria-current="page"` on the last crumb.                |
| 8   | `Pagination`  | `.../pagination`                     | Button                       | Page-window ellipsis logic — the one item here with real logic worth unit-testing.       |
| 9   | `Tooltip`     | `.../tooltip`                        | —                            | CSS/`popover`-positioned only. If it needs a portal or collision detection, defer to P4. |
| 10  | `Tabs`        | `.../tabs`                           | Button                       | `Tabs`/`TabList`/`Tab`/`TabPanel`. Roving tabindex, arrow keys, `aria-controls`.         |

### Explicitly out of scope

Deferred to P4 because each needs a portal, a focus trap, or collision-aware positioning: `Dialog`, `DropdownMenu`, `Popover`, `Combobox`, `Toast` (the region is an organism), `DatePicker`, `DataTable`.

`Tooltip` sits on the line. Build the CSS-only version here; if the first real use hits a clipping or collision problem, move it to P4 rather than growing it in place.

## Cross-cutting work

**Form conventions (decide once, in item 1, then apply everywhere).** How error text is passed and rendered; whether a description and an error can show together; how the required marker is conveyed to assistive tech; whether `FormField` clones its child to inject props or requires an explicit `id`. Every later form molecule inherits these answers, so write them into `docs/` when they are settled.

**Tokens likely needed.** None of these exist yet — each goes through the `add-token` skill, all three CSS blocks, with measured contrast:

- A muted/disabled surface for disabled controls (currently faked with `opacity-50`).
- Soft status backgrounds — `Alert` on a full `bg-error` fill is far too loud for a page-level banner. This probably means `success-subtle` / `warning-subtle` / `error-subtle` pairs, and it is the largest token addition in the milestone.
- An overlay/scrim token, if `Tooltip` needs a raised surface distinct from `surface`.

**Keyboard behavior.** `Tabs` (roving tabindex, Arrow/Home/End), `Pagination` (arrow navigation), `SearchField` (Escape clears), `ButtonGroup` (arrow navigation when selectable). None of this is covered by an existing pattern in the repo — the first one implemented sets the convention.

**Storybook.** Titles under `Components/Molecule/<Name>`. The tier is already pinned in `.storybook/preview.ts`'s `storySort.order`, so no config change is needed.

## Definition of done, per component

The six edits from the `new-component` skill, plus:

- Every variant has a named story and appears in the playground showcase.
- Tests cover rendering, each variant's token classes, keyboard interaction where applicable, and the ARIA wiring (`aria-describedby` actually points at the description node).
- Reviewed in both themes.
- Zero `dark:` classes; zero hardcoded colors.

## Exit criteria

- [ ] All ten components shipped, exported from `packages/ui/src/index.ts`, and present in the showcase.
- [ ] Form conventions documented, and every form molecule follows them.
- [ ] New tokens added in all three CSS blocks and in `docs/theming.mdx` with measured contrast.
- [ ] Keyboard interaction verified by hand for `Tabs`, `Pagination`, `ButtonGroup`, `SearchField`.
- [ ] `pnpm check:full && pnpm typecheck && pnpm test && pnpm build` green.
- [ ] Whole showcase reviewed in light and dark.
- [ ] `0.3.0` published.

## Risks

| Risk                                                                                 | Mitigation                                                                                          |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| The subtle-status token set balloons — four statuses × fill/text/border × two themes | Start with `-subtle` fill + reuse existing `border`/text tokens. Only split further on a real need. |
| `Tooltip` grows into a positioning engine                                            | Hard rule: no portal, no collision detection. Hitting either means it moves to P4 that day.         |
| `FormField` cloning children becomes magic that fights consumers                     | Prefer explicit `id`/`htmlFor` with `useId` as the default, over `cloneElement`.                    |
| `Tabs` looks like a molecule but drifts toward organism once panels lazy-mount       | Keep panel mounting the consumer's choice; ship controlled + uncontrolled, no data fetching.        |
| Accessibility regressions land silently — nothing automated checks a11y until P5     | Assert ARIA relationships in unit tests now, rather than waiting for axe.                           |
