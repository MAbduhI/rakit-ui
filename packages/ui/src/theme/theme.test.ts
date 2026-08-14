import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPalette,
  applyTheme,
  getPalette,
  getAppliedTheme,
  getStoredTheme,
  getSystemTheme,
  initTheme,
  resolveTheme,
  setPalette,
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

describe("palette", () => {
  afterEach(() => {
    setPalette({});
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it("starts empty, leaving styles.css in charge", () => {
    expect(getPalette()).toEqual({});
    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("");
  });

  it("writes only the active theme's overrides", () => {
    applyTheme("light");
    setPalette({ light: { accent: "#0f766e" }, dark: { accent: "#5eead4" } });

    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("#0f766e");
  });

  it("swaps the whole set when the theme flips", () => {
    setPalette({ light: { accent: "#0f766e" }, dark: { accent: "#5eead4" } });

    applyTheme("light");
    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("#0f766e");

    applyTheme("dark");
    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("#5eead4");
  });

  it("clears overrides the new palette does not define", () => {
    applyTheme("light");
    setPalette({ light: { accent: "#0f766e", ring: "#0f766e" } });
    expect(document.documentElement.style.getPropertyValue("--color-ring")).toBe("#0f766e");

    setPalette({ light: { accent: "#b91c1c" } });
    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("#b91c1c");
    // `ring` is gone rather than stale — setPalette replaces, it does not merge.
    expect(document.documentElement.style.getPropertyValue("--color-ring")).toBe("");
  });

  it("drops back to the stylesheet when given an empty palette", () => {
    applyTheme("light");
    setPalette({ light: { accent: "#0f766e" } });
    setPalette({});

    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("");
  });

  it("leaves the DOM alone for a theme with no overrides", () => {
    applyTheme("dark");
    setPalette({ light: { accent: "#0f766e" } });

    expect(document.documentElement.style.getPropertyValue("--color-accent")).toBe("");
  });

  it("can be re-applied without a theme change", () => {
    applyTheme("light");
    setPalette({ light: { surface: "#fafafa" } });
    document.documentElement.style.removeProperty("--color-surface");

    applyPalette("light");
    expect(document.documentElement.style.getPropertyValue("--color-surface")).toBe("#fafafa");
  });
});
