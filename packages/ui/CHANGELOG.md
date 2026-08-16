# Changelog

All notable changes to `@rakitmimpi-ui/ui` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). While pre-1.0, breaking
changes bump the **minor** and everything else the **patch**.

## [0.1.0] - 2026-08-16

Initial public release.

### Added

- Component library across three atomic-design tiers, themed entirely through
  CSS design tokens (no `dark:` classes):
  - **Atoms** — Avatar, Badge, Button, Card, Checkbox, Divider, Fly button/container,
    Icon, Input, Kbd, Label, Loading, Pagination, Radio, ScrollArea, Select,
    Skeleton, Switch, Textarea.
  - **Molecules** — Alert, Breadcrumb, Calendar, Carousel, Collapse, EmptyState,
    Progress, ResizeContainer, Result, RunBanner, Tabs, Timeline.
  - **Organisms** — Dialog, Drawer, DropdownMenu, Maps, Menu, NavMenu, Popover,
    Sidebar, Toaster.
- Light/dark theming: `useTheme` hook plus design tokens in `styles.css`;
  redefining a token on `:root[data-theme="dark"]` themes both modes.
- `Icon` — every `@tabler/icons-react` icon reachable by name (`IconName` union
  generated from the Tabler export list).
- `Maps` on a separate `@rakitmimpi-ui/ui/maps` entry point (keeps Leaflet out of the
  root bundle): markers, polylines/routes, custom marker icons, built-in OSM and
  Google tile layers, and a `customLayers` prop plus `addTileLayer` /
  `removeTileLayer` / `setCustomLayers` for registering tile sources by URL.
- `cn()` — `clsx` + `tailwind-merge` class-merging helper.
- Dual ESM + CJS builds with TypeScript declarations; `react` / `react-dom` are
  peer dependencies, `leaflet` an optional peer.

[0.1.0]: https://github.com/MAbduhI/rakit-ui/releases/tag/v0.1.0
