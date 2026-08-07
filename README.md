# Rakit UI

React component library built on [Tailwind CSS v4](https://tailwindcss.com), published as `@rakit-ui/ui`.

Monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turborepo.dev), linted with [Biome](https://biomejs.dev), tested with [Vitest](https://vitest.dev), documented with [Storybook](https://storybook.js.org), and guarded by [Lefthook](https://lefthook.dev) git hooks.

## Repository layout

```
.
├── apps/
│   └── playground/                # local Vite app for hacking on components
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── app.tsx            # shell + Section helper
│           ├── scratch.tsx        # your scratch space — rewrite at will
│           ├── showcase.tsx       # every component × every variant
│           └── styles.css
├── packages/
│   └── ui/                        # @rakit-ui/ui — the component library
│       ├── docs/                  # Storybook MDX pages (Introduction, Theming)
│       ├── src/
│       │   ├── components/
│       │   │   └── Atom/          # atomic-design tier (see "Component organization")
│       │   │       └── button/    # one folder per component
│       │   │           ├── button.tsx
│       │   │           ├── button.stories.tsx
│       │   │           ├── button.test.tsx
│       │   │           └── index.ts   # barrel export
│       │   ├── utils/             # shared helpers (cn, ...) + their tests
│       │   ├── index.ts           # package public API
│       │   └── styles.css         # Tailwind v4 design tokens
│       └── .storybook/            # Storybook config (react-vite + Tailwind)
├── .claude/                       # Claude Code project settings
├── biome.jsonc                    # Biome lint/format config (biome.full.jsonc = stricter CI variant)
├── lefthook.yml                   # pre-commit hooks
├── turbo.json                     # Turborepo task pipeline
└── pnpm-workspace.yaml
```

## Development

Requires Node.js >= 20 and pnpm.

```bash
pnpm install          # install deps + set up git hooks (lefthook)
pnpm dev              # run the playground at http://localhost:5173 (+ watch-build the library)
pnpm playground       # run only the playground, skipping the library watch build
pnpm build            # build all packages via turbo
pnpm storybook        # run Storybook at http://localhost:6006
pnpm test             # run the Vitest suite once
pnpm --filter @rakit-ui/ui test:watch   # Vitest in watch mode
pnpm check            # biome lint + format check
pnpm check:fix        # auto-fix lint/format issues
pnpm typecheck        # TypeScript type checking
```

Tests are colocated with the code they cover (`button.test.tsx` next to `button.tsx`) and run in `jsdom` with [Testing Library](https://testing-library.com). Add a new test by dropping a `*.test.ts(x)` file anywhere under `packages/ui/src` — Vitest picks it up automatically.

## Playground

`apps/playground` is a plain Vite + React app for building components in a real browser, as opposed to Storybook's isolated frames.

```bash
pnpm dev          # http://localhost:5173
```

Edit anything under `packages/ui/src` and the page hot-reloads immediately — the playground aliases `@rakit-ui/ui` to the library **source** rather than `dist`, so there is no build step in the loop.

Three files matter:

| File           | What it's for                                                                             |
| -------------- | ----------------------------------------------------------------------------------------- |
| `scratch.tsx`  | Your workspace. Rewrite it however you like — nothing else imports it, so it can't break. |
| `showcase.tsx` | Every component with all variants and states. Add a `<Section>` when you add a component. |
| `app.tsx`      | Page shell and the `Section` helper. Rarely needs touching.                               |

### Playground vs. Storybook

Both stay useful. Storybook is the documentation surface — autodocs, arg controls, and the published component catalog. The playground is the scratchpad: real page context, several components composed together, your own state and event handlers, no CSF boilerplate to write first.

### How the aliasing works

Two files have to agree, and both are commented:

- [vite.config.ts](apps/playground/vite.config.ts) — `resolve.alias` maps `@rakit-ui/ui` → `packages/ui/src/index.ts` for the bundler.
- [tsconfig.json](apps/playground/tsconfig.json) — the matching `paths` entry so `tsc` resolves it the same way.

[src/styles.css](apps/playground/src/styles.css) imports the tokens from source and adds `@source "../../../packages/ui/src"` so Tailwind scans the library's files. Without that `@source` line the app renders unstyled components — Tailwind would never see classes like `bg-primary`, because they live outside this app's own directory.

The playground is `private: true` and never published. `@rakit-ui/ui` is still declared as a `workspace:*` dependency so Turborepo knows the build order.

## Component organization & Storybook grouping

Components are grouped by [atomic design](https://bradfrost.com/blog/post/atomic-web-design/) tier. Each tier is a folder under `src/components/`, and each component keeps its own folder inside it:

```
src/components/
├── Atom/           # smallest building blocks — Button, Badge, Input, ...
│   └── button/
│       ├── button.tsx
│       ├── button.stories.tsx
│       ├── button.test.tsx
│       └── index.ts
├── Molecule/       # small compositions of atoms — SearchField, FormRow, ...
├── Organism/       # self-contained sections — Navbar, DataTable, ...
├── Template/       # page-level layouts with slots
└── Page/           # concrete pages wired to real content
```

Tier folders are the one exception to the kebab-case filename rule — they are PascalCase singular (`Atom`, not `atoms`). Everything inside them stays kebab-case.

### The sidebar tree comes from `title`, not from the folder path

This is the part that trips people up: **Storybook does not read your directory structure.** The `stories` glob in [.storybook/main.ts](packages/ui/.storybook/main.ts) only decides _which_ files are picked up:

```ts
stories: ["../docs/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
```

The sidebar tree is built purely from the `title` string in each story's `meta`. Slashes in `title` create the nesting. So moving a component into a new folder changes nothing in Storybook until you update its `title` too.

**The rule: `title` mirrors the path under `src/components/`.**

| File                                            | `title`                           |
| ----------------------------------------------- | --------------------------------- |
| `src/components/Atom/button/button.stories.tsx` | `Components/Atom/Button`          |
| `src/components/Molecule/search-field/…`        | `Components/Molecule/SearchField` |
| `docs/theming.mdx`                              | `Docs/Theming`                    |

```tsx
// src/components/Atom/button/button.stories.tsx
const meta = {
  title: "Components/Atom/Button", // ← this is what groups it under Atom
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;
```

Standalone MDX pages set the same thing through the `<Meta />` block:

```mdx
<Meta title="Docs/Theming" />
```

Tier order in the sidebar is pinned in [.storybook/preview.ts](packages/ui/.storybook/preview.ts) via `parameters.options.storySort` — otherwise the tiers would sort alphabetically and `Page` would land before `Template`. Add any new tier to that `order` array.

### Adding a component

1. Pick the tier and create `src/components/<Tier>/<name>/`.
2. Add `<name>.tsx`, `<name>.stories.tsx`, `<name>.test.tsx`, and an `index.ts` barrel.
3. Set the story `title` to `Components/<Tier>/<Name>`.
4. Export the public pieces from `src/index.ts`.
5. Add a `<Section>` for it in [apps/playground/src/showcase.tsx](apps/playground/src/showcase.tsx).

Import components through their folder barrel (`./components/Atom/button`), never the `.tsx` file directly. Cross-tier imports go through the barrel too — a molecule pulls in `../../Atom/button`.

## Using `@rakit-ui/ui` in your project

### 1. Install

Once published to npm:

```bash
pnpm add @rakit-ui/ui
```

Or straight from git while unpublished (the `prepack` script builds it on install):

```bash
pnpm add "github:<your-org>/<this-repo>#path:packages/ui"
```

Or link it locally from a sibling checkout:

```bash
pnpm add ../ui-pkg/packages/ui
```

### 2. Wire up Tailwind

The library ships Tailwind utility classes in its source and design tokens in `styles.css` — your app's Tailwind build compiles them. In your app's global CSS (Tailwind v4):

```css
@import "tailwindcss";
@import "@rakit-ui/ui/styles.css";
@source "../node_modules/@rakit-ui/ui/dist";
```

> Adjust the `@source` path so it is relative to the CSS file. Tailwind does not scan `node_modules` by default, so this line is required for the component classes to be generated.

### 3. Use the components

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@rakit-ui/ui";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Sign in <Badge variant="secondary">beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input type="email" placeholder="you@example.com" />
        <Button size="lg">Continue</Button>
      </CardContent>
    </Card>
  );
}
```

### Theming

All colors are defined as Tailwind theme tokens in `styles.css` (`--color-primary`, `--color-secondary`, …). Override them in your own CSS after the import:

```css
@theme {
  --color-primary: oklch(0.65 0.2 145); /* make primary green */
}
```

## Components

| Component | Variants                                                                           |
| --------- | ---------------------------------------------------------------------------------- |
| `Button`  | `primary`, `secondary`, `outline`, `ghost`, `destructive` · sizes `sm`, `md`, `lg` |
| `Badge`   | `primary`, `secondary`, `outline`, `destructive`                                   |
| `Card`    | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`  |
| `Input`   | standard text input                                                                |

Also exported: `cn()` — the `clsx` + `tailwind-merge` class helper (`src/utils`).

## Documentation

Run `pnpm storybook` and open http://localhost:6006. Every component has an autodocs page generated from its stories; the **Docs** section (`packages/ui/docs/*.mdx`) has the introduction and theming guides.

## Publishing

```bash
pnpm build
pnpm --filter @rakit-ui/ui publish
```

## License

[MIT](./LICENSE)
