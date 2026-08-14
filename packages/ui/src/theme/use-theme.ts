import { useSyncExternalStore } from "react";
import {
  setPalette as applyPaletteConfig,
  applyTheme,
  getPalette,
  getStoredTheme,
  type ResolvedTheme,
  resolveTheme,
  subscribeToSystemTheme,
  type ThemePalette,
  type ThemePreference,
} from "./theme";

export interface ThemeState {
  /** What the user picked — may be `"system"`. */
  theme: ThemePreference;
  /** What is on screen right now. */
  resolvedTheme: ResolvedTheme;
  /** Token overrides in force, per theme. Empty until `setPalette` is called. */
  palette: ThemePalette;
}

export interface UseThemeResult extends ThemeState {
  /** Switches theme, persists the choice, and updates every `useTheme` caller. */
  setTheme: (theme: ThemePreference) => void;
  /** Flips between light and dark, pinning the result as an explicit choice. */
  toggleTheme: () => void;
  /**
   * Replaces the colour overrides for both themes and applies the active half
   * straight away.
   *
   * ```tsx
   * setPalette({
   *   light: { accent: "#0f766e", ring: "#0f766e" },
   *   dark: { accent: "#5eead4", ring: "#5eead4" },
   * });
   * ```
   *
   * Replaces rather than merges — pass `{}` to fall back to `styles.css`.
   */
  setPalette: (palette: ThemePalette) => void;
}

/*
 * One module-level store rather than a provider: theme is a document-wide
 * concern, so every `useTheme` caller should see the same value with no
 * ceremony at the app root. `useSyncExternalStore` needs `getSnapshot` to hand
 * back a referentially stable object, hence the cached `state`.
 */
const SERVER_STATE: ThemeState = { theme: "system", resolvedTheme: "light", palette: {} };

const listeners = new Set<() => void>();
let state: ThemeState = SERVER_STATE;
let initialized = false;

function setState(next: ThemeState): void {
  if (next.theme === state.theme && next.resolvedTheme === state.resolvedTheme && next.palette === state.palette) {
    return;
  }
  state = next;
  for (const listener of listeners) listener();
}

function ensureInitialized(): void {
  if (initialized || typeof document === "undefined") return;
  initialized = true;

  const theme = getStoredTheme() ?? "system";
  state = { theme, resolvedTheme: applyTheme(theme), palette: getPalette() };
}

function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);

  // Only the first subscriber needs the media listener, but attaching one per
  // subscriber keeps teardown trivial and `matchMedia` listeners are cheap.
  const unsubscribeSystem = subscribeToSystemTheme(() => {
    if (state.theme !== "system") return;
    setState({ theme: "system", resolvedTheme: applyTheme("system"), palette: getPalette() });
  });

  return () => {
    listeners.delete(listener);
    unsubscribeSystem();
  };
}

function getSnapshot(): ThemeState {
  ensureInitialized();
  return state;
}

function getServerSnapshot(): ThemeState {
  return SERVER_STATE;
}

/** Imperative setter — usable outside React (route guards, tests, plain DOM). */
export function setTheme(theme: ThemePreference): void {
  setState({ theme, resolvedTheme: applyTheme(theme), palette: getPalette() });
}

/**
 * Imperative palette setter, for the same reasons as `setTheme` — an app
 * usually applies its brand once at startup, outside any component.
 */
export function setPalette(palette: ThemePalette): void {
  applyPaletteConfig(palette);
  setState({ ...state, palette });
}

/**
 * Reads and writes the active theme.
 *
 * ```tsx
 * const { resolvedTheme, toggleTheme } = useTheme();
 * <Button onClick={toggleTheme}>{resolvedTheme === "dark" ? "Light" : "Dark"}</Button>
 * ```
 */
export function useTheme(): UseThemeResult {
  const { theme, resolvedTheme, palette } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme,
    resolvedTheme,
    palette,
    setTheme,
    setPalette,
    toggleTheme: () => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark"),
  };
}

/** Test-only escape hatch: drops cached state so the next read re-reads the DOM. */
export function resetThemeStore(): void {
  initialized = false;
  state = SERVER_STATE;
  listeners.clear();
  applyPaletteConfig({});
}
