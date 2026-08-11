# Rakit UI — Phases

The build-out plan for `@rakit-ui/ui`, from design tokens to a 1.0 release.

Phases run in order and follow the atomic-design tiers, because each tier is genuinely built out of the one below it: a `FormField` molecule needs `Label` and `Input` to exist first, and a `DashboardShell` template needs a `Navbar` organism. Skipping ahead means building the lower tier twice.

**Phases (`P`) are the work. Milestones (`M`) are the exit checkpoints.** They map one to one: `M3` is the checkpoint that closes `P3`. Each milestone corresponds to a published version.

| Phase | Scope                          | Milestone | Version | Status         |
| ----- | ------------------------------ | --------- | ------- | -------------- |
| P1    | Foundation                     | M1        | `0.1.0` | ✅ Done        |
| P2    | Atom tier                      | M2        | `0.2.0` | 🔨 In progress |
| P3    | Molecule tier                  | M3        | `0.3.0` | ⬜ Planned     |
| P4    | Organism + Template/Page tiers | M4        | `0.4.0` | ⬜ Planned     |
| P5    | Release & consumer DX          | M5        | `1.0.0` | ⬜ Planned     |

Detailed plans: [M3_Plan.md](M3_Plan.md) · [P4_Plan.md](P4_Plan.md)

---

## P1 — Foundation ✅

The theming contract and the tooling that enforces it.

**Shipped**

- Tailwind v4 `@theme` token set in `src/styles.css` — surfaces, lines, brand, text, status — with the dark palette written into both the explicit (`:root[data-theme="dark"]`) and system (`prefers-color-scheme`) blocks.
- Theme runtime in `src/theme/` — `theme.ts` (DOM + `localStorage` plumbing, `themeScript` for no-flash SSR) and `use-theme.ts` (the React hook).
- `cn()` in `src/utils/` — `clsx` + `tailwind-merge`.
- Monorepo tooling: pnpm workspace, Turborepo pipeline, Biome (with the stricter `biome.full.jsonc`), Vitest + Testing Library in jsdom, Lefthook pre-commit, tsup dual ESM/CJS build.
- Storybook 9 (react-vite) with a theme toolbar that writes the same `data-theme` attribute the runtime writes, plus `docs/introduction.mdx` and `docs/theming.mdx`.
- `apps/playground` — Vite app aliased to library **source**, with a showcase page and a token swatch strip.

**M1 exit criteria — all met.** A component written against tokens alone themes itself in both directions with zero `dark:` classes.

---

## P2 — Atom tier 🔨

Complete the single-element vocabulary. Four of roughly a dozen atoms exist; the gaps are what block P3, because a `FormField` cannot be built without `Label`.

**Shipped:** `Button`, `Badge`, `Card` (+ `Header`/`Title`/`Description`/`Content`/`Footer`), `Input`.

**Remaining**

| Component   | Notes                                                              |
| ----------- | ------------------------------------------------------------------ |
| `Label`     | Blocks every form molecule in P3. Highest priority.                |
| `Textarea`  | Mirror `Input`'s variant and sizing vocabulary.                    |
| `Checkbox`  | Native input + token-styled indicator.                             |
| `Radio`     | Ships with a `RadioGroup` wrapper.                                 |
| `Switch`    | Button with `role="switch"`, not a checkbox.                       |
| `Select`    | Native `<select>` at this tier; the custom listbox is an organism. |
| `Avatar`    | Image with initials fallback.                                      |
| `Spinner`   | Needs a `motion-reduce` path.                                      |
| `Skeleton`  | Same.                                                              |
| `Separator` | Horizontal + vertical, `role="separator"`.                         |
| `Kbd`       | Keyboard key rendering.                                            |
| `Link`      | Token-driven focus and visited states.                             |

**M2 exit criteria**

- Every atom above ships with the full six edits from the `new-component` skill.
- All form controls are labelable and keyboard-operable.
- Any token the new atoms needed is added across all three CSS blocks and documented with measured contrast.
- `pnpm check:full`, `typecheck`, `test`, `build` all green; showcase reviewed in both themes.

**Known decisions to make in P2**

- **Ref forwarding.** No component forwards refs today. Form molecules in P3 and focus management in P4 both want it, and adding it after 1.0 is a breaking change. Decide here.
- **Sizing vocabulary.** `Button` uses `sm`/`md`/`lg`. Lock the same scale across every control now, or accept inconsistency permanently.

---

## P3 — Molecule tier ⬜

Small groups of atoms that operate as one control. Full plan in [M3_Plan.md](M3_Plan.md).

Headline items: `FormField`, `SearchField`, `ButtonGroup`, `Alert`, `Tooltip`, `Breadcrumb`, `Pagination`, `Stat`, `AvatarGroup`, `Tabs`.

**M3 exit criteria** — see [M3_Plan.md](M3_Plan.md#exit-criteria).

---

## P4 — Organism + Template/Page tiers ⬜

The complex, stateful tier — dialogs, menus, tables, shells. Full plan in [P4_Plan.md](P4_Plan.md).

This phase carries the single largest architectural decision in the project: whether to build focus trapping, portals, and menu keyboard navigation by hand or adopt a headless primitive library. That decision changes the dependency story for every consumer, so it is made at the top of the phase, not discovered mid-way.

**M4 exit criteria** — see [P4_Plan.md](P4_Plan.md#exit-criteria).

---

## P5 — Release & consumer DX ⬜

Everything between "the components exist" and "someone else can depend on them."

- **Freeze the API.** Token names, export paths, variant vocabulary, ref forwarding. Each becomes a major-version cost after 1.0.
- **Automated a11y.** `@storybook/addon-a11y` plus axe assertions in Vitest. Nothing checks accessibility automatically today.
- **CI.** No workflow exists yet — `check:full`, `typecheck`, `test`, `build` on every PR, plus a published Storybook build.
- **Changelog + releases.** `CHANGELOG.md`, git tags, and a release checklist (see the `release` skill). Consider Changesets once contributors exceed one.
- **Consumer docs.** A real install → configure → use path, leading with the `@source "../node_modules/@rakit-ui/ui/dist"` directive that is required and easy to miss.
- **Framework verification.** Vite, Next.js App Router (RSC boundaries — components using `useTheme` need `"use client"`), and Remix.
- **Bundle budget.** Per-entry size tracking and verified tree-shaking.

**M5 exit criteria**

- `1.0.0` published and installable from a clean app in all three frameworks.
- CI green on every PR; Storybook published.
- Zero axe violations across all stories.
- Documented upgrade path from `0.x`.

---

## Working agreements

- **Tokens before components.** A component needing a color it cannot name is a missing token. Add it across all three CSS blocks with measured contrast — never inline a hex, never add a `dark:` class.
- **Six edits per component.** Implementation, story, test, barrel, `src/index.ts`, showcase section. Fewer means it is not shipped.
- **Both themes, every time.** Nothing in the pipeline renders dark mode. It is a human check until P5 automates it.
- **Phases can overlap at the edges** — an atom needed urgently by a P3 molecule can be pulled forward. Milestones cannot: `M3` does not close while any P3 item is open.
