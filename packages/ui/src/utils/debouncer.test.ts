import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debouncer";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the delay before running", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst into a single trailing call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(50);
    debounced("c");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("runs again after the window closes", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(100);
    debounced("second");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, "second");
  });

  it("defaults to a 300ms wait", () => {
    const fn = vi.fn();
    const debounced = debounce(fn);

    debounced();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  describe("cancel", () => {
    it("drops a pending call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(1000);

      expect(fn).not.toHaveBeenCalled();
    });

    it("is safe to call with nothing pending", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      expect(() => debounced.cancel()).not.toThrow();
      debounced();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("flush", () => {
    it("runs a pending call immediately with the latest arguments", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 500);

      debounced("a");
      debounced("b");
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("b");
    });

    it("does not fire the timer again after flushing", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 500);

      debounced();
      debounced.flush();
      vi.advanceTimersByTime(1000);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("does nothing when there is no pending call", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 500);

      debounced.flush();
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
