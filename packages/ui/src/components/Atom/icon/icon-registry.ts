import {
  IconAlertTriangle,
  IconArrowUp,
  IconBell,
  IconBrandWhatsapp,
  IconBuildingWarehouse,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClock,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFilter,
  IconHelp,
  IconHome,
  IconInfoCircle,
  IconMapPin,
  IconMenu2,
  IconMessageCircle,
  IconMinus,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconStar,
  IconTrash,
  IconTruckDelivery,
  IconUpload,
  IconUser,
  IconX,
} from "@tabler/icons-react";

/*
 * A curated set, imported statically on purpose.
 *
 * @tabler/icons-react ships 6185 icons. A namespace import plus a string lookup
 * would defeat tree-shaking and pull all of them into every consumer's bundle,
 * and the package's own `dynamic-imports` map is unusable — it points at
 * `./icons/*.ts` files that are not published (only `.mjs` is). Listing the
 * icons we actually use keeps the bundle honest and makes `name` autocomplete.
 *
 * Adding an icon is two lines: the import above, and an entry here.
 */
export const iconRegistry = {
  "alert-triangle": IconAlertTriangle,
  "arrow-up": IconArrowUp,
  bell: IconBell,
  "brand-whatsapp": IconBrandWhatsapp,
  "building-warehouse": IconBuildingWarehouse,
  calendar: IconCalendar,
  check: IconCheck,
  "chevron-down": IconChevronDown,
  "chevron-left": IconChevronLeft,
  "chevron-right": IconChevronRight,
  "chevron-up": IconChevronUp,
  clock: IconClock,
  download: IconDownload,
  edit: IconEdit,
  "external-link": IconExternalLink,
  filter: IconFilter,
  help: IconHelp,
  home: IconHome,
  "info-circle": IconInfoCircle,
  "map-pin": IconMapPin,
  menu: IconMenu2,
  "message-circle": IconMessageCircle,
  minus: IconMinus,
  phone: IconPhone,
  plus: IconPlus,
  refresh: IconRefresh,
  search: IconSearch,
  settings: IconSettings,
  star: IconStar,
  trash: IconTrash,
  "truck-delivery": IconTruckDelivery,
  upload: IconUpload,
  user: IconUser,
  x: IconX,
} as const;

export type IconName = keyof typeof iconRegistry;

/** Every registered name, for stories, showcases, and `<select>` controls. */
export const iconNames = Object.keys(iconRegistry) as Array<IconName>;
