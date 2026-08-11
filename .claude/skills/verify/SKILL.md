---
name: verify
description: Run the full Rakit UI quality gate — Biome check, typecheck, Vitest, and build — in the order that surfaces root causes first, then diagnose and fix what fails. Use before committing, before opening a PR, when the user asks to "verify", "check everything", "make sure it passes", or when a turbo/CI run reports a failure that needs triage.
---

# Verifying the workspace

Run from the repo root. The order matters: formatting noise hides type errors, type errors produce confusing test failures, and the build is the slowest step so it goes last.

```bash
pnpm check:fix    # 1. Biome lint + format, auto-fixing what it can
pnpm typecheck    # 2. tsc --noEmit per package
pnpm test         # 3. Vitest, single run, via turbo
pnpm build        # 4. tsup ESM + CJS + d.ts, then copies styles.css
```

Stop at the first failure and fix it before moving on. Re-run only the failed step while iterating; run the whole chain once more at the end.

## Reading each step

**`pnpm check:fix`** — writes fixes in place, so re-read any file it touched before editing it further. What it cannot auto-fix is usually a real convention breach:

| Rule                            | What it wants                                           |
| ------------------------------- | ------------------------------------------------------- |
| `useFilenamingConvention`       | kebab-case, except the `Atom`/`Molecule`/… tier folders |
| `useConsistentTypeDefinitions`  | `interface`, not `type`, for object shapes              |
| `useConsistentArrayType`        | `Array<T>`, not `T[]`                                   |
| `noConsole`                     | error — delete the log, do not downgrade the rule       |
| `useComponentExportOnlyModules` | component files export only components and types        |
| `useSortedClasses`              | Tailwind class order (auto-fixed)                       |

Stories and `.storybook/` are exempt from the export rule via a Biome override. `pnpm check:full` runs the stricter `biome.full.jsonc` — worth a pass before a release, not on every change. Biome lints `packages/ui/**` only; markdown and CSS are Prettier's, applied by the pre-commit hook.

**`pnpm typecheck`** — `tsconfig.json` puts `vitest/globals` and `@testing-library/jest-dom` in `types`, so `describe`/`it`/`expect` and `toBeInTheDocument` resolve without per-file imports. If those come back "cannot find name", the failure is a tsconfig or install problem, not the test file.

**`pnpm test`** — Vitest + Testing Library in jsdom, config at `packages/ui/vitest.config.ts`, setup at `vitest.setup.ts`. Tests are colocated (`button.test.tsx` beside `button.tsx`); there is no `__tests__` tree. For a tight loop use `pnpm --filter @rakit-ui/ui test:watch`, and narrow with `-t "name"`.

Theme tests touch `document.documentElement`, `localStorage`, and `matchMedia`. A theme test that fails only when the full suite runs is leaked state between tests, not a bug in `theme.ts` — check the teardown before touching the source.

**`pnpm build`** — turbo caches aggressively. A build that passes against stale inputs proves nothing; add `--force` when a result looks impossible. The ui build is `tsup && cp src/styles.css dist/styles.css`, so a token change that never reaches `dist/styles.css` means the copy step did not run.

## Things the gate does not catch

Run these by eye when the change warrants it — none of them are automated yet:

- **Both themes.** `pnpm storybook` and flip the toolbar theme, or `pnpm dev` for the playground showcase. Nothing in CI renders dark mode.
- **Contrast** on any new or changed token — measure it, see the `add-token` skill.
- **Keyboard and screen-reader behavior** on anything interactive. There is no axe/a11y addon wired up.
- **The public surface.** A new component that never got added to `packages/ui/src/index.ts` builds, typechecks, and tests clean while being invisible to consumers.

## Reporting

Say what actually ran and what it said. If a step was skipped, say which and why. Paste the failing output rather than paraphrasing it — a truncated error is the most common reason a second attempt repeats the first one's mistake.
