/**
 * A debounced version of `fn`: it runs once `wait` ms have passed without
 * another call. Each call restarts the clock, and only the most recent
 * arguments are used.
 *
 * Trailing edge only — nothing fires on the first call. That is what a search
 * field or an autosave wants; a leading-edge variant would need its own flag.
 */
export interface DebouncedFunction<Args extends Array<unknown>> {
  (...args: Args): void;
  /**
   * Drops a pending call. Always do this on unmount — otherwise the callback
   * fires against an unmounted component.
   */
  cancel: () => void;
  /** Runs a pending call immediately, if there is one. */
  flush: () => void;
}

export function debounce<Args extends Array<unknown>>(
  fn: (...args: Args) => void,
  wait = 300,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Args | undefined;

  const debounced = (...args: Args) => {
    pending = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      pending = undefined;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  debounced.flush = () => {
    if (timer === undefined || pending === undefined) {
      return;
    }
    const args = pending;
    debounced.cancel();
    fn(...args);
  };

  return debounced;
}
