---
name: release
description: Cut a release of @rakit-ui/ui — decide the semver bump, update the changelog and version, run the full gate, and publish to npm. Use when the user asks to release, publish, cut a version, bump the version, or ship the package.
---

# Releasing `@rakit-ui/ui`

The package is public (`publishConfig.access: "public"`), currently at the version in `packages/ui/package.json`, and pre-1.0 — which changes how semver reads. Publishing is irreversible: npm allows unpublish only within 72 hours, and a version number is never reusable. **Confirm with the user before `pnpm publish`.**

## 1. Decide the bump

While `0.x`, the leading zero absorbs the major slot: breaking changes go in the **minor**, everything else in the **patch**.

| Change                                                    | Pre-1.0 bump |
| --------------------------------------------------------- | ------------ |
| Removed/renamed an export, prop, variant, or token        | minor        |
| Changed a component's default variant or rendered element | minor        |
| New component, new variant, new token, new prop           | patch        |
| Bug fix, style tweak, docs, types-only fix                | patch        |
| Widened a peer dependency range                           | patch        |
| Narrowed a peer dependency range                          | minor        |

Design tokens are public API — consumers override them. Renaming `--color-surface-alt` is as breaking as renaming a prop.

To see what is actually in the release:

```bash
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD
git diff $(git describe --tags --abbrev=0 2>/dev/null)..HEAD -- packages/ui/src/index.ts packages/ui/src/styles.css
```

That second diff is the one that decides the bump — the public export list and the token set.

## 2. Verify

Run the full gate (see the `verify` skill), plus the stricter lint pass that only matters at release time:

```bash
pnpm check:full
pnpm typecheck && pnpm test && pnpm build
```

## 3. Inspect the artifact

`files` is `["dist"]`, so only `dist/` ships. Confirm the four entry points named in `package.json` all exist and that the tokens made it across:

```bash
ls -la packages/ui/dist                       # index.js, index.cjs, index.d.ts, styles.css
pnpm --filter @rakit-ui/ui pack --dry-run     # exact file list and unpacked size
```

`styles.css` is copied by the build script, not emitted by tsup — it is the file most likely to be missing or stale. Check that a token you changed this cycle is actually in `dist/styles.css`.

Also confirm `react` and `react-dom` are still **peer** dependencies only. If either appears under `dependencies`, stop — that ships a second React into consumer apps.

## 4. Version, changelog, tag

```bash
pnpm --filter @rakit-ui/ui version <patch|minor>   # updates package.json, no git tag
```

Write `packages/ui/CHANGELOG.md` in Keep a Changelog order — Added / Changed / Deprecated / Removed / Fixed — grouped for a consumer, not a commit log. Breaking changes get an explicit migration line ("`bg-muted` → `bg-surface-alt`"), not just a mention.

Commit and tag on `development`, then merge to `main`:

```bash
git add -A && git commit -m "chore(release): v<version>"
git tag v<version>
```

Lefthook runs Biome on staged JS/TS and Prettier on md/css at pre-commit, so the changelog gets reformatted on the way in — expect that.

## 5. Publish

Only after the user confirms:

```bash
pnpm --filter @rakit-ui/ui publish --access public
git push && git push --tags
```

`prepack` runs the build again, so the tarball is built from the committed tree, not from whatever `dist/` happened to hold.

## 6. Verify the published package

```bash
npm view @rakit-ui/ui version
npm view @rakit-ui/ui files
```

Then install it into a scratch app and render one component. The consumer-side step people forget is the Tailwind source directive — without it the package's utility classes never get generated:

```css
@import "tailwindcss";
@import "@rakit-ui/ui/styles.css";
@source "../node_modules/@rakit-ui/ui/dist";
```

If a release ships broken, publish a fixed patch — do not unpublish and reuse a version.

## Approaching 1.0

Before the major, settle these; each is a breaking change that is much cheaper now than later: the token names, the tier layout in the export paths, whether components forward refs, and the variant vocabulary (`primary`/`secondary`/`outline`/`ghost`/`destructive`). After 1.0, each of those costs a major.
