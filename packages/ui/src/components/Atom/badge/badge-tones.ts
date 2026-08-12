/*
 * The colour half of a Badge variant — border, fill, and text, nothing about
 * shape or size. Kept apart from `badge.tsx` so other components can dress
 * themselves in the same variant without importing the pill geometry, and
 * without a second copy of the palette drifting out of sync. `Toaster` uses it
 * for the toast card.
 *
 * Status variants map 1:1 onto the status tokens — never an ad-hoc green or
 * red. Each fill pairs with its own `-foreground` token, picked per theme to
 * clear 4.5:1 (see docs/theming.mdx for the measured ratios).
 */
export type BadgeTone =
  | "primary"
  | "primary-highlight"
  | "secondary"
  | "outline"
  | "accent"
  | "accent-highlight"
  | "success"
  | "success-highlight"
  | "warning"
  | "warning-highlight"
  | "error"
  | "error-highlight";

export const badgeTones: Record<BadgeTone, string> = {
  primary: "border-transparent bg-accent text-accent-foreground",
  "primary-highlight": "border-accent bg-white text-accent",
  secondary: "border-transparent bg-surface-alt text-primary",
  outline: "border-border text-primary",
  accent: "border-transparent bg-accent-secondary text-accent-secondary-foreground",
  "accent-highlight": "border-accent-secondary bg-white text-accent-secondary",
  success: "border-transparent bg-success text-success-foreground",
  "success-highlight": "border-success bg-white text-success",
  warning: "border-transparent bg-warning text-warning-foreground",
  "warning-highlight": "border-warning bg-white text-warning",
  error: "border-transparent bg-error text-error-foreground",
  "error-highlight": "border-error bg-white text-error",
};

export const badgeToneNames = Object.keys(badgeTones) as Array<BadgeTone>;
