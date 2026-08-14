import * as TablerIcons from "@tabler/icons-react";
import type { IconName } from "./icon-name";

/*
 * Every Tabler icon, keyed by kebab name.
 *
 * The whole set is reachable, and the generated `IconName` union makes a wrong
 * name a compile error rather than a blank space. The trade is bundle size:
 * `Object.entries` over the namespace is a dynamic read, so a consumer's
 * bundler cannot tree-shake the unused icons and ships all ~6250. Our own
 * `dist` stays small only because the package is an external dependency — the
 * weight lands in the app, not here.
 *
 * ponytail: if that weight ever matters, the fix is a build step that rewrites
 * `<Icon name="x" />` into a direct import, or a curated map behind a second
 * entry point.
 *
 * The barrel also exports `createReactComponent`, `icons`, `iconsList` and
 * `default`, none of which are components. Filtering on the `Icon` prefix keeps
 * them out — without it `name="icons"` typechecks and then renders nothing.
 */

type TablerIconComponent = (typeof TablerIcons)["IconMapPin"];

/**
 * `IconMapPin` -> `map-pin`.
 *
 * Deliberately identical to the transform in `scripts/generate-icon-names.mjs`,
 * which builds the `IconName` union from the same export list. `pnpm icons:check`
 * fails if the two ever disagree.
 */
export function toIconName(exportName: string): string {
  return exportName
    .replace(/^Icon/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export const iconRegistry = Object.fromEntries(
  Object.entries(TablerIcons)
    // Icons are `forwardRef` objects, not functions — hence the `object` test.
    .filter(([key, value]) => key.startsWith("Icon") && typeof value === "object" && value !== null)
    .map(([key, value]) => [toIconName(key), value]),
) as Record<IconName, TablerIconComponent>;

/** Every registered name, for stories, showcases, and `<select>` controls. */
export const iconNames = Object.keys(iconRegistry) as Array<IconName>;
