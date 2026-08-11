---
name: new-component
description: Scaffold a new Rakit UI component end to end — tier folder, implementation, story, test, barrel, public export, and playground showcase section. Use whenever the user asks to add, create, or scaffold a component (button, input, alert, tabs, dialog, …) in packages/ui, or asks where a new component should live.
---

# Adding a component to Rakit UI

Every component ships as **six edits**. A component that is missing any of them is not done — the barrel, the public export, and the showcase section are what make it reachable by consumers and reviewable in a browser.

## 1. Pick the tier

`src/components/<Tier>/<name>/` where `<Tier>` is PascalCase singular. This is the _only_ place PascalCase is allowed — every other path segment is kebab-case.

| Tier       | What belongs there                                      | Examples                      |
| ---------- | ------------------------------------------------------- | ----------------------------- |
| `Atom`     | One element, no composition of other Rakit components   | Button, Input, Badge, Label   |
| `Molecule` | A small group of atoms that works as one control        | FormField, SearchField, Alert |
| `Organism` | A distinct page section; owns state, focus, or a portal | Dialog, DataTable, Navbar     |
| `Template` | Page skeleton with slots, no real content               | DashboardShell, AuthLayout    |
| `Page`     | A template filled with example content                  | Story-only compositions       |

If it renders another Rakit component, it is not an Atom. If it traps focus or portals, it is at least an Organism.

## 2. Write the four files

`src/components/<Tier>/<name>/<name>.tsx` — cva for variants, `cn()` last so `className` wins:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      info: "border-border bg-surface-alt text-primary",
      success: "border-success bg-success text-success-foreground",
      error: "border-error bg-error text-error-foreground",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="status"
      {...props}
    />
  );
}
```

Non-negotiables, all enforced by review or Biome:

- **Tokens only.** `bg-surface`, `text-secondary`, `border-input`, `bg-accent`. Never `bg-white`, never `bg-green-600`. A missing color means a missing token — run the `add-token` skill, do not inline a hex.
- **No `dark:` classes.** Dark mode redefines the same custom properties, so a token-only component themes itself. Reaching for `dark:` is the signal that a token is missing.
- **Status through `success` / `warning` / `error`**, each paired with its `-foreground` for text on the fill. Brand through `accent` / `accent-secondary`.
- **Spread native props** and forward them, so consumers get `id`, `aria-*`, `onClick` for free.
- **`interface`, not `type`.** `Array<T>`, not `T[]`. Double quotes, semicolons, 120-char lines.
- Only components and their types may be exported from a component file (`useComponentExportOnlyModules`). A helper that is not a component goes in `src/utils/`.
- Sort Tailwind classes (`useSortedClasses`) — `pnpm check:fix` does it for you.

`<name>.stories.tsx` — the `title` decides the sidebar position, **not** the folder path:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./alert";

const meta = {
  title: "Components/Molecule/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    children: "Your changes were saved.",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "error"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = {
  args: { variant: "success" },
};
```

Give every variant its own named export — the showcase covers the grid, the stories cover the individual states.

`<name>.test.tsx` — render, assert behavior, assert the token classes per variant:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it("renders children", () => {
    render(<Alert>Saved</Alert>);
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it.each([
    ["success", "bg-success", "text-success-foreground"],
    ["error", "bg-error", "text-error-foreground"],
  ] as const)(
    "renders the %s variant with its own token pair",
    (variant, fill, foreground) => {
      render(<Alert variant={variant}>Status</Alert>);
      expect(screen.getByText("Status")).toHaveClass(fill, foreground);
    },
  );
});
```

`describe`/`it`/`expect` and the jest-dom matchers are global — no imports needed beyond the component itself, though importing from `vitest` matches the existing files.

`index.ts` — the barrel, one line per public piece:

```ts
export { Alert, type AlertProps } from "./alert";
```

Nothing outside the folder may import `./alert.tsx` directly. Import the folder.

## 3. Export from the package

Add to `packages/ui/src/index.ts`, keeping the file alphabetized by module path:

```ts
export { Alert, type AlertProps } from "./components/Molecule/alert";
```

A component absent from this file does not exist as far as consumers are concerned.

## 4. Add a showcase section

In `apps/playground/src/showcase.tsx`, import from `@rakit-ui/ui` (the alias points at library source, so there is no build step) and add a `<Section>` rendering every variant × size. This is the only place a palette change can be eyeballed across the whole library at once.

## 5. Verify

```bash
pnpm check:fix && pnpm typecheck && pnpm test
```

Then look at it in both themes — `pnpm dev` for the playground, or `pnpm storybook` and flip the toolbar theme switch. A component that only got checked in light mode is half-checked.

## Multi-part components

When a component ships as a set (`Card` / `CardHeader` / `CardTitle` / `CardContent` / `CardFooter`), keep them all in one `<name>.tsx`, export each from the barrel, and list each in `src/index.ts`. Follow the existing `card` folder for the shape.
