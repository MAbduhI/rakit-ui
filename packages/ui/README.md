# @rakitmimpi-ui/ui

React component library built on [Tailwind CSS v4](https://tailwindcss.com). Token-themed (light/dark), tree-shakeable, ships ESM + CJS + types.

## Install

```bash
pnpm add @rakitmimpi-ui/ui
# peers: react, react-dom (>=18)
```

## 1. Wire up Tailwind

The library ships uncompiled Tailwind utility classes plus design tokens in `styles.css` — your app's Tailwind build compiles them. In your app's global CSS (Tailwind v4):

```css
@import "tailwindcss";
@import "@rakitmimpi-ui/ui/styles.css";
@source "../node_modules/@rakitmimpi-ui/ui/dist";
```

> Adjust the `@source` path so it is relative to that CSS file. Tailwind does not scan `node_modules` by default, so this line is required for the component classes to be generated.

## 2. Use the components

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@rakitmimpi-ui/ui";

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

Also exported: `cn()` — the `clsx` + `tailwind-merge` class helper.

## Maps (`@rakitmimpi-ui/ui/maps`)

`Maps` pulls in [Leaflet](https://leafletjs.com), so it lives at a separate entry point to keep Leaflet out of the root bundle. Add Leaflet yourself (optional peer dependency):

```bash
pnpm add leaflet
```

```tsx
import { Maps, type CustomTileLayer } from "@rakitmimpi-ui/ui/maps";

const customLayers: Array<CustomTileLayer> = [
  {
    id: "opentopo",
    name: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 17, attribution: "&copy; OpenTopoMap (CC-BY-SA)" },
  },
];

<Maps
  center={[-6.2088, 106.8456]}
  zoom={12}
  customLayers={customLayers}
  tileLayer="opentopo"
  className="h-96 w-full"
/>;
```

Built-in tile sources: `osm` (default), `google-roadmap`, `google-satellite`, `google-hybrid`, `google-terrain` (Google layers need a `googleMapsApiKey`). `customLayers` registers extra tile sources by URL; point `tileLayer` at any id to open on it.

## Theming

Colors are Tailwind theme tokens in `styles.css` (`--color-primary`, `--color-secondary`, …). Override them in your own CSS after the import:

```css
@theme {
  --color-primary: oklch(0.65 0.2 145);
}
```

Dark mode is redefined on `:root[data-theme="dark"]`; components carry no `dark:` classes, so overriding a token themes both modes.

## License

[MIT](./LICENSE)
