import { useSyncExternalStore } from "react";
import {
  applyTheme,
  getStoredTheme,
  type ResolvedTheme,
  resolveTheme,
  subscribeToSystemTheme,
  type ThemePreference,
} from "./theme";

export interface ThemeState {
  /** What the user picked — may be `"system"`. */
  theme: ThemePreference;
  /** What is on screen right now. */
  resolvedTheme: ResolvedTheme;
}

export interface UseThemeResult extends ThemeState {
  /** Switches theme, persists the choice, and updates every `useTheme` caller. */
  setTheme: (theme: ThemePreference) => void;
  /** Flips between light and dark, pinning the result as an explicit choice. */
  toggleTheme: () => void;
}

/*
 * One module-level store rather than a provider: theme is a document-wide
 * concern, so every `useTheme` caller should see the same value with no
 * ceremony at the app root. `useSyncExternalStore` needs `getSnapshot` to hand
 * back a referentially stable object, hence the cached `state`.
 */
const SERVER_STATE: ThemeState = { theme: "system", resolvedTheme: "light" };

const listeners = new Set<() => void>();
let state: ThemeState = SERVER_STATE;
let initialized = false;

function setState(next: ThemeState): void {
  if (next.theme === state.theme && next.resolvedTheme === state.resolvedTheme) return;
  state = next;
  for (const listener of listeners) listener();
}

function ensureInitialized(): void {
  if (initialized || typeof document === "undefined") return;
  initialized = true;

  const theme = getStoredTheme() ?? "system";
  state = { theme, resolvedTheme: applyTheme(theme) };
}

function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);

  // Only the first subscriber needs the media listener, but attaching one per
  // subscriber keeps teardown trivial and `matchMedia` listeners are cheap.
  const unsubscribeSystem = subscribeToSystemTheme(() => {
    if (state.theme !== "system") return;
    setState({ theme: "system", resolvedTheme: applyTheme("system") });
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
  setState({ theme, resolvedTheme: applyTheme(theme) });
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
  const { theme, resolvedTheme } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark"),
  };
}

/** Test-only escape hatch: drops cached state so the next read re-reads the DOM. */
export function resetThemeStore(): void {
  initialized = false;
  state = SERVER_STATE;
  listeners.clear();
}
