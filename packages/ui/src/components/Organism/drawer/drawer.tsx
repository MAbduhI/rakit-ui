import { createContext, type HTMLAttributes, type ReactNode, useContext, useEffect, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../Atom/icon";

/* Same native <dialog> basis as Dialog — focus trap, Escape and top layer come
 * from the browser. Only the geometry differs: pinned to an edge, full bleed on
 * the cross axis. */

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

interface DrawerContextValue {
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

const sides: Record<DrawerSide, string> = {
  left: "mr-auto ml-0 h-dvh max-h-dvh rounded-none border-y-0 border-l-0",
  right: "mr-0 ml-auto h-dvh max-h-dvh rounded-none border-y-0 border-r-0",
  top: "mt-0 mb-auto w-dvw max-w-dvw rounded-none border-x-0 border-t-0",
  bottom: "mt-auto mb-0 w-dvw max-w-dvw rounded-none border-x-0 border-b-0",
};

const inlineSizes: Record<DrawerSize, string> = {
  sm: "w-[min(18rem,100vw)]",
  md: "w-[min(24rem,100vw)]",
  lg: "w-[min(32rem,100vw)]",
  xl: "w-[min(42rem,100vw)]",
  full: "w-dvw",
};

const blockSizes: Record<DrawerSize, string> = {
  sm: "h-[min(14rem,100dvh)]",
  md: "h-[min(20rem,100dvh)]",
  lg: "h-[min(28rem,100dvh)]",
  xl: "h-[min(36rem,100dvh)]",
  full: "h-dvh",
};

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, "onClose"> {
  open: boolean;
  side?: DrawerSide;
  size?: DrawerSize;
  onClose?: () => void;
  onOpen?: () => void;
  /** Whether a backdrop click closes it. Escape always does. */
  clickOutside?: boolean;
  children: ReactNode;
}

export function Drawer({
  open,
  side = "right",
  size = "md",
  onClose,
  onOpen,
  clickOutside = true,
  children,
  className,
  ...props
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const drawer = ref.current;
    if (!drawer) {
      return;
    }
    if (open && !drawer.open) {
      drawer.showModal();
      onOpenRef.current?.();
    } else if (!open && drawer.open) {
      drawer.close();
    }
  }, [open]);

  const isInline = side === "left" || side === "right";

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: dismissal by keyboard is Escape, which <dialog> handles natively and reports through onClose
    <dialog
      ref={ref}
      className={cn(
        "max-h-dvh max-w-dvw border-border bg-surface p-0 text-primary shadow-lg",
        "backdrop:bg-overlay/60 backdrop:backdrop-blur-[1px]",
        sides[side],
        isInline ? inlineSizes[size] : blockSizes[size],
        className,
      )}
      onClick={(event) => {
        if (clickOutside && event.target === ref.current) {
          onClose?.();
        }
      }}
      onClose={() => onClose?.()}
      {...props}
    >
      <DrawerContext.Provider value={{ close: () => onClose?.() }}>{children}</DrawerContext.Provider>
    </dialog>
  );
}

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {}

export function DrawerContent({ className, ...props }: DrawerContentProps) {
  return <div className={cn("flex h-full flex-col", className)} {...props} />;
}

export interface DrawerSectionProps extends HTMLAttributes<HTMLDivElement> {
  devider?: boolean;
}

export interface DrawerHeaderProps extends DrawerSectionProps {
  showClose?: boolean;
}

export function DrawerHeader({ className, devider = false, showClose = true, children, ...props }: DrawerHeaderProps) {
  const context = useContext(DrawerContext);

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

export function DrawerBody({ className, ...props }: DrawerSectionProps) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-2", className)} {...props} />;
}

export function DrawerFooter({ className, devider = false, ...props }: DrawerSectionProps) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-end gap-2 p-6", devider && "border-border border-t", className)}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("font-semibold text-lg leading-none tracking-tight", className)} {...props} />;
}

export function DrawerDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-secondary text-sm", className)} {...props} />;
}
