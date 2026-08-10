import { act, render, renderHook, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "./theme";
import { resetThemeStore, useTheme } from "./use-theme";

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

function emitSystemChange() {
  for (const listener of listeners) listener({} as MediaQueryListEvent);
}

beforeEach(() => {
  listeners.clear();
  localStorage.clear();
  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  resetThemeStore();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTheme", () => {
  it('starts on "system" and resolves against the OS', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("restores a stored preference on first read", () => {
    stubMatchMedia(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(result.current.resolvedTheme).toBe("light");
  });

  it("setTheme updates the DOM, storage, and the hook value", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("toggleTheme flips to the opposite explicit theme", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("keeps every subscriber in sync without a provider", async () => {
    stubMatchMedia(false);

    function Toggle() {
      const { toggleTheme } = useTheme();
      return (
        <button type="button" onClick={toggleTheme}>
          toggle
        </button>
      );
    }

    function Readout() {
      const { resolvedTheme } = useTheme();
      return <span data-testid="readout">{resolvedTheme}</span>;
    }

    render(
      <>
        <Toggle />
        <Readout />
      </>,
    );

    expect(screen.getByTestId("readout")).toHaveTextContent("light");
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByTestId("readout")).toHaveTextContent("dark");
  });

  it('follows the OS while the preference is "system"', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolvedTheme).toBe("light");

    stubMatchMedia(true);
    act(() => emitSystemChange());

    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("ignores OS changes once the user has chosen explicitly", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("light"));
    stubMatchMedia(true);
    act(() => emitSystemChange());

    expect(result.current.resolvedTheme).toBe("light");
  });
});
