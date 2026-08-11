export { Icon, type IconProps } from "./icon";
// `iconRegistry` is internal — `maps` needs the components to serialise markers.
// It is deliberately not re-exported from the package's public `src/index.ts`.
export { type IconName, iconNames, iconRegistry } from "./icon-registry";
