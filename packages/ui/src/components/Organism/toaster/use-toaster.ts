import { createContext, type ReactNode, useContext } from "react";
import type { BadgeProps } from "../../Atom/badge";
import type { IconName } from "../../Atom/icon";

/*
 * Context and hook live apart from the provider because `useToaster` is not a
 * component — `useComponentExportOnlyModules` keeps component files to
 * components and types, the same split `src/theme/` uses.
 */

/** Every Badge variant, plus `custom` for a toast you render yourself. */
export type ToastVariant = NonNullable<BadgeProps["variant"]> | "custom";

export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  icon?: IconName;
  /** Milliseconds before it dismisses itself. `0` keeps it until closed. */
  duration?: number;
  /** `variant="custom"` only — replaces the whole toast body. */
  render?: (toast: { id: string; close: () => void }) => ReactNode;
}

export interface Toast extends ToastOptions {
  id: string;
}

export interface ToasterContextValue {
  /** Queues a toast and returns its id, so it can be closed early. */
  showToaster: (options: ToastOptions) => string;
  closeToast: (id: string) => void;
  closeAllToast: () => void;
  toasts: Array<Toast>;
}

export const ToasterContext = createContext<ToasterContextValue | null>(null);

export function useToaster(): ToasterContextValue {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToaster must be used inside a <ToasterProvider>.");
  }
  return context;
}
