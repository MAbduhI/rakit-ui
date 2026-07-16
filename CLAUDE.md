# RakitMimpi UI monorepo

React component library (`@rakitmimpi/ui`) built on Tailwind CSS v4. pnpm workspace + Turborepo.

## Layout

- `packages/ui` — the library. Each component lives in its own folder under `src/components/<name>/` (kebab-case folder + filenames): `<name>.tsx`, a colocated `<name>.stories.tsx`, a colocated `<name>.test.tsx`, and an `index.ts` barrel re-exporting the public pieces. Never import a component's `.tsx` file directly from outside its folder — import the folder (`./components/button`), which resolves to `index.ts`.
- `src/utils/` — shared helpers (currently just `cn`), same folder pattern: implementation + `*.test.ts` + barrel `index.ts`.
- `src/index.ts` — the package's public API; every new export must be added here.
- `src/styles.css` — Tailwind v4 `@theme` design tokens.
- `docs/*.mdx` — standalone Storybook doc pages (Introduction, Theming) not tied to a component; registered via the `../docs/**/*.mdx` entry in `.storybook/main.ts`'s `stories` glob.
- Storybook config is inside the package at `packages/ui/.storybook/` (react-vite framework, Tailwind wired via `@tailwindcss/vite` in `viteFinal`).
- `.claude/settings.json` at repo root — project-local Claude Code permission allowlist for common pnpm/git commands.

## Commands (run from repo root)

- `pnpm build` — turbo build of all packages (ui builds with tsup: ESM + CJS + d.ts, then copies `styles.css` to `dist/`)
- `pnpm storybook` — Storybook dev server on port 6006
- `pnpm test` — turbo run of the Vitest suite (single run); `pnpm --filter @rakitmimpi/ui test:watch` for watch mode
- `pnpm check` / `pnpm check:fix` — Biome lint + format (`check:full` runs the stricter `biome.full.jsonc`)
- `pnpm typecheck` — `tsc --noEmit` per package
- Single package: `pnpm --filter @rakitmimpi/ui <script>`

## Conventions (enforced by Biome — see biome.jsonc)

- Filenames: kebab-case. Type definitions: `interface` (not `type`). Arrays: `Array<T>` (not `T[]`).
- Double quotes, semicolons, trailing commas, 120-char lines, 2-space indent.
- `noConsole` is an error; Tailwind classes should be sorted (`useSortedClasses`).
- `useComponentExportOnlyModules`: component files must only export components (+ types). Stories and `.storybook/` are exempt via an override.
- Biome only lints `packages/ui/**`; CSS/MD are formatted by Prettier via the pre-commit hook.

## Component patterns

- Variants via `class-variance-authority` (cva); class merging via the `cn()` helper (`clsx` + `tailwind-merge`).
- Components accept and forward native HTML props; `className` is always merged last so consumers can override styles.
- Colors reference theme tokens (`bg-primary`, `text-muted-foreground`, …) defined in `src/styles.css` — never hardcode palette colors, add tokens instead.
- New component checklist: create `src/components/<name>/<name>.tsx` + `<name>.stories.tsx` + `<name>.test.tsx` + `index.ts` barrel, then export from `src/index.ts`.

## Testing

- Vitest + `@testing-library/react` + `jsdom`, configured in `packages/ui/vitest.config.ts` (setup file: `vitest.setup.ts`, registers `@testing-library/jest-dom` matchers).
- Test files match `src/**/*.test.{ts,tsx}` and live next to the code under test — no separate `__tests__` tree.
- `tsconfig.json`'s `types` includes `vitest/globals` and `@testing-library/jest-dom` so `describe`/`it`/`expect` and jest-dom matchers (`toBeInTheDocument`, `toHaveClass`, …) typecheck without per-file imports.

## Tooling notes

- Git hooks: Lefthook (`lefthook.yml`) runs Biome on staged JS/TS and Prettier on md/css at pre-commit. Installed by the root `prepare` script.
- Default git branch is `development` (Biome's VCS integration expects this).
- `react`/`react-dom` are peer dependencies of the ui package — keep them out of `dependencies`.
- Consumers must add `@source "../node_modules/@rakitmimpi/ui/dist"` to their Tailwind CSS entry; the package ships uncompiled utility classes.
