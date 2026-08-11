---
name: add-token
description: Add, rename, or change a Rakit UI design token in packages/ui/src/styles.css across all three required blocks and document it with measured contrast in docs/theming.mdx. Use whenever the user wants a new color/radius token, a palette tweak, a dark-mode fix, or when a component needs a color that no existing token provides.
---

# Adding a design token

Tokens are the whole theming contract: components carry no `dark:` classes, so a token that exists in only one of the three blocks silently breaks one theme. Every token change touches **three CSS blocks plus the docs**.

## Before adding: is a token actually missing?

Check the existing set first — `bg`, `surface`, `surface-alt`, `surface-hover`, `border`, `input`, `ring`, `accent`, `accent-secondary` (+ `-foreground`), `primary`, `secondary`, `success`, `warning`, `error` (+ `-foreground`), `radius-md`.

Two traps worth naming:

- `--color-primary` / `--color-secondary` are **text** colors. `text-primary` is near-black; `bg-primary` paints near-black too, _not_ the brand navy. Brand is `accent`.
- Anything that is a visual boundary of a control uses `--color-input` (darker), not `--color-border` (decorative, 1.2:1 — fails WCAG 1.4.11 as a control boundary).

If the need is "a status color" or "a brand color", the answer is almost always an existing token, not a new one.

## The three blocks in `packages/ui/src/styles.css`

Add the declaration in all three, in the same position within its comment-headed group:

1. **`@theme { … }`** — the light value. This block is what generates the Tailwind utility (`--color-foo` → `bg-foo`, `text-foo`, `border-foo`). A token added only to the dark blocks generates no utility at all.
2. **`:root[data-theme="dark"] { … }`** — the explicit dark value, set by `applyTheme()` and the no-flash inline script.
3. **`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`** — the system-dark mirror.

Blocks 2 and 3 must stay byte-identical in their declarations. CSS gives no way to share one declaration block between a selector and a media query, so this duplication is deliberate — the file says so, keep it true.

A token whose value is intentionally the same in both themes (like `--color-accent`) still gets written into blocks 2 and 3, with a comment saying it is on purpose. Omitting it works today and breaks the moment someone reorders the file.

## Naming

- Color tokens are `--color-<name>`; the Tailwind utility drops the prefix.
- A fill that carries text needs a paired `--color-<name>-foreground`. Ship the pair together or the first consumer will hardcode text color.
- Keep names semantic (`surface-hover`, `accent-secondary`), never literal (`gray-100`, `navy`).

## Contrast — measure, don't estimate

Every new value gets checked before it lands, in **both** themes and against every surface it can sit on (`bg`, `surface`, `surface-alt`):

| Use                                | Minimum |
| ---------------------------------- | ------- |
| Body text on a surface             | 4.5:1   |
| Large text (≥ 18.66px bold / 24px) | 3:1     |
| Focus ring, control borders, icons | 3:1     |
| Text on its own `-foreground` fill | 4.5:1   |

The existing file records why values diverge — `--color-ring` is lifted to `#6b7bc4` in dark because the brand navy sits at 1.75:1 on the dark page. Write that kind of note as a comment whenever a dark value is not simply a darker/lighter twin of the light one.

## Document it

`packages/ui/docs/theming.mdx` carries a `<Swatch>` row per token, grouped under `### Surfaces and lines`, `### Brand`, `### Text`, `### Status`:

```jsx
<Swatch
  token="surface-raised"
  light="#FFFFFF"
  dark="#1E2634"
  usage="Popovers, menus floating above a card"
/>
```

Hex values in the docs are uppercase; in `styles.css` they are lowercase. Match each file's existing style. Then add the measured ratio to the `## Contrast` section, and mention the token in `## Overriding tokens` if consumers are expected to retheme it.

## After the edit

```bash
pnpm check:fix && pnpm test && pnpm dev
```

Open the playground showcase — it renders a swatch strip of every token, so a new or changed value can be compared against the rest of the palette in both themes in one screen. Flip the theme; a token that looks right in only one theme is not done.

## Removing or renaming a token

A token is public API — it is what consumers override. Renaming one is a breaking change for the package version. Grep the whole workspace (`packages/ui/src`, `apps/playground/src`, `docs/*.mdx`) for both the custom property and every utility spelling (`bg-`, `text-`, `border-`, `outline-`, `ring-`, `fill-`) before removing anything.
