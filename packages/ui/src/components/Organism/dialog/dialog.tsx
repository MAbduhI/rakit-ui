import { createContext, type HTMLAttributes, type ReactNode, useContext, useEffect, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../Atom/icon";

/*
 * Built on the native <dialog> element rather than a portal plus a hand-rolled
 * focus trap. `showModal()` hands us the top layer, a focus trap, inert
 * background content, Escape-to-close and a ::backdrop for free — all the
 * pieces P4_Plan listed as the reason to consider a primitive library.
 */

interface DialogContextValue {
  close: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, "onClose"> {
  open: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  children: ReactNode;
}

export function Dialog({ open, onClose, onOpen, children, className, ...props }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      onOpenRef.current?.();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: dismissal by keyboard is Escape, which <dialog> handles natively and reports through onClose
    <dialog
      ref={ref}
      className={cn(
        "m-auto max-h-[85vh] w-[min(32rem,calc(100vw-2rem))] rounded-md border border-border bg-surface p-0 text-primary shadow-lg",
        "backdrop:bg-overlay/60 backdrop:backdrop-blur-[1px]",
        className,
      )}
      // Fires for Escape and for `close()` alike, so it is the single exit.
      onClose={() => onClose?.()}
      // The backdrop is part of the dialog's box, so a click landing on the
      // element itself (not its content) is a click outside the panel.
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose?.();
        }
      }}
      {...props}
    >
      <DialogContext.Provider value={{ close: () => onClose?.() }}>{children}</DialogContext.Provider>
    </dialog>
  );
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return <div className={cn("flex max-h-[85vh] flex-col", className)} {...props} />;
}

export interface DialogSectionProps extends HTMLAttributes<HTMLDivElement> {
  devider?: boolean;
}

export interface DialogHeaderProps extends DialogSectionProps {
  /** The ✕ button. On by default — a modal needs a visible way out. */
  showClose?: boolean;
}

export function DialogHeader({ className, devider = false, showClose = true, children, ...props }: DialogHeaderProps) {
  const context = useContext(DialogContext);

  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-4 p-6",
        devider && "border-border border-b",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1.5">{children}</div>
      {showClose ? (
        <button
          aria-label="Close"
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-secondary transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          onClick={() => context?.close()}
          type="button"
        >
          <Icon name="x" size="md" />
        </button>
      ) : null}
    </div>
  );
}

export function DialogBody({ className, ...props }: DialogSectionProps) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-2", className)} {...props} />;
}

export function DialogFooter({ className, devider = false, ...props }: DialogSectionProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-end gap-2 p-6", devider && "border-border border-t", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-semibold text-lg leading-none tracking-tight", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-secondary text-sm", className)} {...props} />;
}
