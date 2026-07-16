# RakitMimpi UI

React component library built on [Tailwind CSS v4](https://tailwindcss.com), published as `@rakitmimpi/ui`.

Monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turborepo.dev), linted with [Biome](https://biomejs.dev), tested with [Vitest](https://vitest.dev), documented with [Storybook](https://storybook.js.org), and guarded by [Lefthook](https://lefthook.dev) git hooks.

## Repository layout

```
.
├── packages/
│   └── ui/                        # @rakitmimpi/ui — the component library
│       ├── docs/                  # Storybook MDX pages (Introduction, Theming)
│       ├── src/
│       │   ├── components/
│       │   │   └── button/        # one folder per component
│       │   │       ├── button.tsx
│       │   │       ├── button.stories.tsx
│       │   │       ├── button.test.tsx
│       │   │       └── index.ts   # barrel export
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
pnpm build            # build all packages via turbo
pnpm dev              # watch-build all packages via turbo
pnpm storybook        # run Storybook at http://localhost:6006
pnpm test             # run the Vitest suite once
pnpm --filter @rakitmimpi/ui test:watch   # Vitest in watch mode
pnpm check            # biome lint + format check
pnpm check:fix        # auto-fix lint/format issues
pnpm typecheck        # TypeScript type checking
```

Tests are colocated with the code they cover (`button.test.tsx` next to `button.tsx`) and run in `jsdom` with [Testing Library](https://testing-library.com). Add a new test by dropping a `*.test.ts(x)` file anywhere under `packages/ui/src` — Vitest picks it up automatically.

## Using `@rakitmimpi/ui` in your project

### 1. Install

Once published to npm:

```bash
pnpm add @rakitmimpi/ui
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
@import "@rakitmimpi/ui/styles.css";
@source "../node_modules/@rakitmimpi/ui/dist";
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
} from "@rakitmimpi/ui";

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
pnpm --filter @rakitmimpi/ui publish
```

## License

[MIT](./LICENSE)
