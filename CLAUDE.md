# Rakit UI monorepo

React component library (`@rakit-ui/ui`) built on Tailwind CSS v4. pnpm workspace + Turborepo.

## Layout

- `packages/ui` — the library. Components are grouped by atomic-design tier: `src/components/<Tier>/<name>/`, where `<Tier>` is PascalCase singular (`Atom`, `Molecule`, `Organism`, `Template`, `Page`) — the only exception to the kebab-case rule. Inside a tier, each component has its own kebab-case folder holding `<name>.tsx`, a colocated `<name>.stories.tsx`, a colocated `<name>.test.tsx`, and an `index.ts` barrel re-exporting the public pieces. Never import a component's `.tsx` file directly from outside its folder — import the folder (`./components/Atom/button`), which resolves to `index.ts`.
- `src/utils/` — shared helpers (currently just `cn`), same folder pattern: implementation + `*.test.ts` + barrel `index.ts`.
- `src/theme/` — light/dark theme runtime (`theme.ts` core + `use-theme.ts` React hook), same folder pattern. Not a component tier; it ships DOM/storage plumbing, not UI.
- `src/index.ts` — the package's public API; every new export must be added here.
- `src/styles.css` — Tailwind v4 `@theme` design tokens plus the dark-theme overrides.
- `docs/*.mdx` — standalone Storybook doc pages (Introduction, Theming) not tied to a component; registered via the `../docs/**/*.mdx` entry in `.storybook/main.ts`'s `stories` glob.
- Storybook config is inside the package at `packages/ui/.storybook/` (react-vite framework, Tailwind wired via `@tailwindcss/vite` in `viteFinal`).
- `apps/playground` — private Vite + React app for hacking on components in a real browser (`pnpm dev` → port 5173). `src/scratch.tsx` is a disposable scratch space; `src/showcase.tsx` renders every component × variant; `src/app.tsx` is the shell plus a `Section` helper. It aliases `@rakit-ui/ui` to the library **source** (`resolve.alias` in `vite.config.ts` + a matching `paths` entry in `tsconfig.json` — keep both in sync), and `src/styles.css` adds `@source "../../../packages/ui/src"` so Tailwind scans the library's classes. Not published.
- `.claude/settings.json` at repo root — project-local Claude Code permission allowlist for common pnpm/git commands.

## Commands (run from repo root)

- `pnpm dev` — turbo `dev`: runs the playground on port 5173 and tsup's watch build of the library. `pnpm playground` runs only the playground.
- `pnpm build` — turbo build of all packages (ui builds with tsup: ESM + CJS + d.ts, then copies `styles.css` to `dist/`)
- `pnpm storybook` — Storybook dev server on port 6006
- `pnpm test` — turbo run of the Vitest suite (single run); `pnpm --filter @rakit-ui/ui test:watch` for watch mode
- `pnpm check` / `pnpm check:fix` — Biome lint + format (`check:full` runs the stricter `biome.full.jsonc`)
- `pnpm typecheck` — `tsc --noEmit` per package
- Single package: `pnpm --filter @rakit-ui/ui <script>`

## Conventions (enforced by Biome — see biome.jsonc)

- Filenames: kebab-case. Type definitions: `interface` (not `type`). Arrays: `Array<T>` (not `T[]`).
- Double quotes, semicolons, trailing commas, 120-char lines, 2-space indent.
- `noConsole` is an error; Tailwind classes should be sorted (`useSortedClasses`).
- `useComponentExportOnlyModules`: component files must only export components (+ types). Stories and `.storybook/` are exempt via an override.
- Biome only lints `packages/ui/**`; CSS/MD are formatted by Prettier via the pre-commit hook.

## Component patterns

- Variants via `class-variance-authority` (cva); class merging via the `cn()` helper (`clsx` + `tailwind-merge`).
- Components accept and forward native HTML props; `className` is always merged last so consumers can override styles.
- Colors reference theme tokens (`bg-surface`, `text-secondary`, `bg-accent`, …) defined in `src/styles.css` — never hardcode palette colors or Tailwind palette classes (`bg-green-600`), add tokens instead.
- Components carry **no `dark:` classes**. Dark mode redefines the same custom properties on `:root[data-theme="dark"]`, so a token-only component themes itself. If you reach for `dark:`, the token is missing.
- Status meaning goes through `success` / `warning` / `error` (each with a matching `-foreground` for text on the fill); brand goes through `accent` / `accent-secondary`.
- Adding a token means adding it in three places: the `@theme` block, the `:root[data-theme="dark"]` block, and the `prefers-color-scheme` mirror of that block. Then document it in `docs/theming.mdx` with its measured contrast.
- New component checklist: pick a tier, create `src/components/<Tier>/<name>/<name>.tsx` + `<name>.stories.tsx` + `<name>.test.tsx` + `index.ts` barrel, set the story `title` to `Components/<Tier>/<Name>`, export from `src/index.ts`, then add a `<Section>` for it in `apps/playground/src/showcase.tsx`.

## Storybook grouping

- The sidebar tree is built from each story's `meta.title` string, **not** from the folder path — the `stories` glob in `.storybook/main.ts` only decides which files load. Moving a component to a different folder does nothing until its `title` is updated.
- Convention: `title` mirrors the path under `src/components/`, e.g. `src/components/Atom/button/` → `title: "Components/Atom/Button"`. Standalone MDX pages use `<Meta title="Docs/…" />`.
- Tier order is pinned in `.storybook/preview.ts` under `parameters.options.storySort.order`; add new tiers there or they sort alphabetically.

## Testing

- Vitest + `@testing-library/react` + `jsdom`, configured in `packages/ui/vitest.config.ts` (setup file: `vitest.setup.ts`, registers `@testing-library/jest-dom` matchers).
- Test files match `src/**/*.test.{ts,tsx}` and live next to the code under test — no separate `__tests__` tree.
- `tsconfig.json`'s `types` includes `vitest/globals` and `@testing-library/jest-dom` so `describe`/`it`/`expect` and jest-dom matchers (`toBeInTheDocument`, `toHaveClass`, …) typecheck without per-file imports.

## Tooling notes

- Git hooks: Lefthook (`lefthook.yml`) runs Biome on staged JS/TS and Prettier on md/css at pre-commit. Installed by the root `prepare` script.
- Default git branch is `development` (Biome's VCS integration expects this).
- `react`/`react-dom` are peer dependencies of the ui package — keep them out of `dependencies`.
- Consumers must add `@source "../node_modules/@rakit-ui/ui/dist"` to their Tailwind CSS entry; the package ships uncompiled utility classes.
