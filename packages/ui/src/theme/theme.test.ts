import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  getAppliedTheme,
  getStoredTheme,
  getSystemTheme,
  initTheme,
  resolveTheme,
  setStoredTheme,
  subscribeToSystemTheme,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  themeScript,
} from "./theme";

/**
 * jsdom ships no `matchMedia`, so every test that cares about the OS
 * preference installs one. `listeners` lets a test fire a change event.
 */
const listeners = new Set<(event: MediaQueryListEvent) => void>();

function stubMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: prefersDark && query.includes("dark"),
      media: query,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    })),
  );
}

beforeEach(() => {
  listeners.clear();
  localStorage.clear();
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getSystemTheme", () => {
  it("reports dark when the OS prefers dark", () => {
    stubMatchMedia(true);
    expect(getSystemTheme()).toBe("dark");
  });

  it("falls back to light when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(getSystemTheme()).toBe("light");
  });
});

describe("storage", () => {
  it("round-trips an explicit preference", () => {
    setStoredTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it('clears the key for "system" so the OS stays in charge', () => {
    setStoredTheme("dark");
    setStoredTheme("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(getStoredTheme()).toBeNull();
  });

  it("ignores a garbage value left by an older version", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "solarized");
    expect(getStoredTheme()).toBeNull();
  });

  it("survives storage throwing (Safari private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(getStoredTheme()).toBeNull();
  });
});

describe("applyTheme", () => {
  it("writes the resolved theme to <html> and persists the preference", () => {
    stubMatchMedia(false);
    expect(applyTheme("dark")).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it('resolves "system" against the OS but stores no explicit choice', () => {
    stubMatchMedia(true);
    expect(applyTheme("system")).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(getStoredTheme()).toBeNull();
  });
});

describe("resolveTheme", () => {
  it("passes explicit preferences straight through", () => {
    stubMatchMedia(true);
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });
});

describe("initTheme", () => {
  it("restores a stored preference over the OS preference", () => {
    stubMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    expect(initTheme()).toBe("light");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });

  it('defaults to "system" when nothing is stored', () => {
    stubMatchMedia(true);
    expect(initTheme()).toBe("system");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });
});

describe("getAppliedTheme", () => {
  it("reads the attribute already on <html>", () => {
    stubMatchMedia(false);
    document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
    expect(getAppliedTheme()).toBe("dark");
  });

  it("falls back to the OS preference when the attribute is absent", () => {
    stubMatchMedia(true);
    expect(getAppliedTheme()).toBe("dark");
  });
});

describe("subscribeToSystemTheme", () => {
  it("notifies on change and detaches on unsubscribe", () => {
    stubMatchMedia(false);
    const listener = vi.fn();
    const unsubscribe = subscribeToSystemTheme(listener);

    for (const registered of listeners) registered({} as MediaQueryListEvent);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(listeners.size).toBe(0);
  });

  it("returns a no-op when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(() => subscribeToSystemTheme(vi.fn())()).not.toThrow();
  });
});

describe("themeScript", () => {
  it("applies the stored theme before paint", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    stubMatchMedia(false);

    // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as a browser would.
    eval(themeScript);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("falls back to the OS preference with nothing stored", () => {
    stubMatchMedia(true);

    // biome-ignore lint/security/noGlobalEval: exercising the inline <head> script exactly as a browser would.
    eval(themeScript);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });
});
