import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Badge } from "../../Atom/badge";
import { Icon } from "../../Atom/icon";
import { type Toast, ToasterContext, type ToastOptions, type ToastPosition } from "./use-toaster";

const positions: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

export interface ToasterProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /** Default `duration` for toasts that do not set one. */
  duration?: number;
  /** Oldest toasts drop off past this many. */
  max?: number;
}

export function ToasterProvider({
  children,
  position = "bottom-right",
  duration = 4000,
  max = 5,
}: ToasterProviderProps) {
  const [toasts, setToasts] = useState<Array<Toast>>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);

  const closeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const closeAllToast = useCallback(() => {
    for (const timer of timers.current.values()) {
      clearTimeout(timer);
    }
    timers.current.clear();
    setToasts([]);
  }, []);

  const showToaster = useCallback(
    (options: ToastOptions) => {
      // A counter, not Math.random — ids stay stable and testable.
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const toast: Toast = { id, variant: "primary", duration, ...options };

      setToasts((current) => {
        const next = [...current, toast];
        // Drop the oldest past `max`, and stop their timers with them.
        const dropped = next.slice(0, Math.max(0, next.length - max));
        for (const stale of dropped) {
          const timer = timers.current.get(stale.id);
          if (timer) {
            clearTimeout(timer);
            timers.current.delete(stale.id);
          }
        }
        return next.slice(-max);
      });

      if (toast.duration && toast.duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => closeToast(id), toast.duration),
        );
      }
      return id;
    },
    [closeToast, duration, max],
  );

  const value = useMemo(
    () => ({ showToaster, closeToast, closeAllToast, toasts }),
    [showToaster, closeToast, closeAllToast, toasts],
  );

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className={cn("pointer-events-none fixed z-50 flex flex-col gap-2", positions[position])}
        role="status"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} onClose={() => closeToast(toast.id)} toast={toast} />
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

interface ToastCardProps {
  toast: Toast;
  onClose: () => void;
}

function ToastCard({ toast, onClose }: ToastCardProps) {
  if (toast.variant === "custom") {
    return (
      <div className="pointer-events-auto" data-toast-id={toast.id}>
        {toast.render?.({ id: toast.id, close: onClose })}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-md border border-border bg-surface p-4 shadow-lg"
      data-toast-id={toast.id}
    >
      {toast.icon ? <Icon className="mt-0.5 shrink-0 text-secondary" name={toast.icon} size="md" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {toast.title ? (
          <div className="flex items-center gap-2">
            <Badge variant={toast.variant}>{toast.title}</Badge>
          </div>
        ) : null}
        {toast.description ? <p className="text-secondary text-sm">{toast.description}</p> : null}
      </div>
      <button
        aria-label="Close notification"
        className="-mr-1 -mt-1 shrink-0 rounded p-1 text-secondary transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onClick={onClose}
        type="button"
      >
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}
