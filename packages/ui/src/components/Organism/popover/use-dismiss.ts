import { type RefObject, useEffect } from "react";

/*
 * Outside-click and Escape dismissal for a non-modal surface.
 *
 * `pointerdown` rather than `click`: a click fires after mouseup, so a drag
 * that starts inside the panel and ends outside it would close the panel and
 * lose the selection.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, open, onDismiss]);
}
