/**
 * Framework-agnostic theme plumbing.
 *
 * The DOM contract is a single attribute on `<html>`:
 *
 *   <html data-theme="light">   →  light tokens
 *   <html data-theme="dark">    →  dark tokens
 *   <html>                      →  follow `prefers-color-scheme` (CSS only)
 *
 * We always write the *resolved* theme to the attribute and keep the user's
 * *preference* (which may be "system") in localStorage. That keeps `styles.css`
 * down to one selector and lets Tailwind's `dark:` variant work under a system
 * preference too.
 */

/** What the user picked. `"system"` defers to the OS. */
export type ThemePreference = "light" | "dark" | "system";

/** What is actually on screen once `"system"` has been resolved. */
export type ResolvedTheme = "light" | "dark";

/**
 * Every colour token `styles.css` defines, without the `--color-` prefix.
 * Typing the palette against this list is what makes `setPalette` autocomplete
 * and stops a typo silently doing nothing.
 */
export const THEME_TOKENS = [
  "bg",
  "surface",
  "surface-alt",
  "surface-hover",
  "border",
  "input",
  "ring",
  "overlay",
  "accent",
  "accent-foreground",
  "accent-secondary",
  "accent-secondary-foreground",
  "primary",
  "secondary",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "error",
  "error-foreground",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];

/** Any subset of the tokens — anything omitted keeps its stylesheet value. */
export type ThemePaletteOverrides = Partial<Record<ThemeToken, string>>;

export interface ThemePalette {
  light?: ThemePaletteOverrides;
  dark?: ThemePaletteOverrides;
}

export const THEME_STORAGE_KEY = "rakit-ui-theme";
export const THEME_ATTRIBUTE = "data-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  return window.matchMedia(DARK_QUERY);
}

/** The OS preference, or `"light"` when it cannot be read (SSR, old browsers). */
export function getSystemTheme(): ResolvedTheme {
  return getMediaQuery()?.matches ? "dark" : "light";
}

/**
 * The persisted preference, or `null` if the user has never chosen one.
 * Storage access is wrapped because Safari throws in private browsing.
 */
export function getStoredTheme(): ThemePreference | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Persists a preference. `"system"` clears the key so the OS stays in charge. */
export function setStoredTheme(preference: ThemePreference): void {
  if (typeof localStorage === "undefined") return;

  try {
    if (preference === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Storage is unavailable — the theme still applies for this page view.
  }
}

/*
 * Palette overrides are written as inline custom properties on <html>, which
 * beats the stylesheet's `:root` rules without touching them. Only the active
 * theme's half is ever applied, so switching theme swaps the whole set.
 *
 * Deliberately not persisted: a palette is application configuration supplied
 * on every load, not a user preference like light/dark. Persisting it would
 * also mean the no-flash `themeScript` had to replay it, which it cannot.
 */
let palette: ThemePalette = {};

/** Property names currently written, so they can be removed on the next pass. */
const appliedProperties = new Set<string>();

/** The palette in force. */
export function getPalette(): ThemePalette {
  return palette;
}

/** Re-writes the inline overrides for `resolved`, clearing whatever was there. */
export function applyPalette(resolved: ResolvedTheme = getAppliedTheme()): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  for (const property of appliedProperties) {
    root.style.removeProperty(property);
  }
  appliedProperties.clear();

  const overrides = palette[resolved];
  if (!overrides) return;

  for (const [token, value] of Object.entries(overrides)) {
    const property = `--color-${token}`;
    root.style.setProperty(property, value);
    appliedProperties.add(property);
  }
}

/**
 * Replaces the palette and applies it immediately. Replaces rather than merges,
 * so a caller always knows exactly which overrides are live; pass `{}` to drop
 * back to the stylesheet's own values.
 */
export function setPalette(next: ThemePalette): void {
  palette = next;
  applyPalette();
}

/** Collapses a preference down to the theme that should actually render. */
export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

/** Reads `data-theme` off `<html>`, falling back to the system preference. */
export function getAppliedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) === "dark" ? "dark" : getSystemTheme();
}

/**
 * Writes the preference to `<html>` and to storage, and returns what ended up
 * on screen.
 */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, resolved);
    // The overrides are per-theme, so they have to be rewritten on every flip.
    applyPalette(resolved);
  }

  setStoredTheme(preference);
  return resolved;
}

/**
 * Applies whatever is already stored (or the system preference) and returns the
 * preference in force. Safe to call more than once.
 */
export function initTheme(): ThemePreference {
  const preference = getStoredTheme() ?? "system";
  applyTheme(preference);
  return preference;
}

/**
 * Calls `listener` when the OS preference changes. Returns an unsubscribe
 * function; a no-op where `matchMedia` is unavailable.
 */
export function subscribeToSystemTheme(listener: () => void): () => void {
  const query = getMediaQuery();
  if (!query) return () => undefined;

  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * Minified copy of `initTheme` for a blocking `<script>` in `<head>`. Running
 * it before first paint is what stops a light flash on a dark-themed reload.
 *
 * ```html
 * <script>{themeScript}</script>
 * ```
 */
export const themeScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=s==="light"||s==="dark"?s:(window.matchMedia&&window.matchMedia("${DARK_QUERY}").matches?"dark":"light");document.documentElement.setAttribute("${THEME_ATTRIBUTE}",t)}catch(e){}})()`;
