import { type AnchorHTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";
import { DropdownMenu, type DropdownMenuItem } from "../dropdown-menu";
import { Popover, type PopoverPlacement } from "../popover";

/** What the label does on pointer-over. `none` leaves it to `className`. */
export type NavMenuHoverAnimation = "underline" | "lift" | "glow" | "scale" | "none";

const hoverAnimations: Record<NavMenuHoverAnimation, string> = {
  // The underline grows from the centre rather than fading in.
  underline:
    "after:-translate-x-1/2 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:rounded-full after:bg-current after:transition-[width] after:duration-200 hover:after:w-[calc(100%-1.5rem)]",
  lift: "transition-transform duration-200 hover:-translate-y-0.5",
  glow: "transition-[filter,color] duration-200 hover:brightness-125",
  scale: "transition-transform duration-200 hover:scale-105",
  none: "",
};

/*
 * Three of these names already exist on anchor attributes with different
 * meanings — `onSelect` is a DOM event, `type` is a MIME hint, and React 19
 * types `popover` as the native popover attribute — so they are omitted before
 * being redeclared.
 */
export interface NavMenuProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "content" | "onSelect" | "popover" | "type"> {
  label: ReactNode;
  /** Renders an `<a>` when set, a `<button>` otherwise. */
  href?: string;
  icon?: IconName;
  /** Trailing node — a "Beta" Badge, a count, a chevron. */
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  hoverAnimation?: NavMenuHoverAnimation;
  /** Turns the item into a DropdownMenu trigger. */
  dropdown?: Array<DropdownMenuItem>;
  /** Turns the item into a Popover trigger. Wins over `dropdown` if both. */
  popover?: ReactNode;
  placement?: PopoverPlacement;
  /** Open the dropdown or popover on hover as well as click. */
  openOnHover?: boolean;
  /** Classes for the floating panel, not the item. */
  contentClassName?: string;
  onSelect?: (item: DropdownMenuItem) => void;
}

export function NavMenu({
  label,
  href,
  icon,
  badge,
  active = false,
  disabled = false,
  hoverAnimation = "underline",
  dropdown,
  popover,
  placement = "bottom",
  openOnHover = false,
  className,
  contentClassName,
  onSelect,
  ...props
}: NavMenuProps) {
  const body = (
    <>
      {icon ? <Icon className="shrink-0" name={icon} size="sm" /> : null}
      <span>{label}</span>
      {badge}
      {dropdown || popover ? <Icon className="shrink-0 opacity-70" name="chevron-down" size="sm" /> : null}
    </>
  );

  const itemClass = cn(
    "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-medium text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
    active ? "text-accent" : "text-primary hover:text-accent",
    disabled && "pointer-events-none opacity-50",
    hoverAnimations[hoverAnimation],
    className,
  );

  const item =
    href && !disabled ? (
      <a aria-current={active ? "page" : undefined} className={itemClass} href={href} {...props}>
        {body}
      </a>
    ) : (
      <button
        aria-current={active ? "page" : undefined}
        className={itemClass}
        disabled={disabled}
        type="button"
        {...(props as Record<string, unknown>)}
      >
        {body}
      </button>
    );

  if (popover) {
    return (
      <Popover contentClassName={contentClassName} onHover={openOnHover} placement={placement} trigger={item}>
        {popover}
      </Popover>
    );
  }

  if (dropdown) {
    return (
      <DropdownMenu
        contentClassName={contentClassName}
        items={dropdown}
        onHover={openOnHover}
        onSelect={onSelect}
        placement={placement}
        trigger={item}
      />
    );
  }

  return item;
}

export type NavMenuOrientation = "horizontal" | "vertical";
export type NavMenuType = "expand" | "minimize";

export interface NavMenuContainerProps {
  children: ReactNode;
  orientation?: NavMenuOrientation;
  /** Brand slot — a logo node or an icon name. */
  icon?: ReactNode | IconName;
  /** `minimize` hides the labels; vertical collapses to an icon rail. */
  type?: NavMenuType;
  /** Animate the switch between `expand` and `minimize`. */
  animateOnChange?: boolean;
  /**
   * Horizontal only: slide the bar out of view while scrolling down and bring
   * it back on the way up. Defaults on when horizontal.
   */
  hideOnScroll?: boolean;
  /** Pixels scrolled before hiding kicks in. */
  hideThreshold?: number;
  /** Right-hand slot — sign-in buttons, a theme toggle. */
  actions?: ReactNode;
  /** Classes for the nav element. */
  className?: string;
  /** Classes for the inner row, e.g. `max-w-6xl` to constrain it. */
  innerClassName?: string;
  /** Classes for the items group. */
  listClassName?: string;
  sticky?: boolean;
}

export function NavMenuContainer({
  children,
  orientation = "horizontal",
  icon,
  type = "expand",
  animateOnChange = true,
  hideOnScroll,
  hideThreshold = 64,
  actions,
  className,
  innerClassName,
  listClassName,
  sticky = true,
}: NavMenuContainerProps) {
  const isHorizontal = orientation === "horizontal";
  const shouldHide = hideOnScroll ?? isHorizontal;
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!shouldHide || !isHorizontal) {
      return;
    }

    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Only react once past the threshold, so a short bounce at the top of the
      // page does not flicker the bar.
      if (y > hideThreshold) {
        setHidden(y > lastY.current);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldHide, isHorizontal, hideThreshold]);

  const brand =
    typeof icon === "string" ? <Icon className="text-accent" name={icon as IconName} size="xl" /> : (icon ?? null);

  const minimized = type === "minimize";

  if (!isHorizontal) {
    return (
      <nav
        aria-label="Main"
        className={cn(
          "flex h-full flex-col border-border border-r bg-surface",
          animateOnChange && "transition-[width] duration-200 motion-reduce:transition-none",
          minimized ? "w-16" : "w-64",
          className,
        )}
        data-type={type}
      >
        {brand ? (
          <div className={cn("flex shrink-0 items-center border-border border-b p-3", minimized && "justify-center")}>
            {brand}
          </div>
        ) : null}
        <div className={cn("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2", listClassName)}>{children}</div>
        {actions && !minimized ? <div className="shrink-0 border-border border-t p-3">{actions}</div> : null}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className={cn(
        "z-40 w-full border-border border-b bg-surface",
        sticky && "sticky top-0",
        shouldHide && "transition-transform duration-300 motion-reduce:transition-none",
        shouldHide && hidden && "-translate-y-full",
        className,
      )}
      data-hidden={shouldHide && hidden ? "true" : undefined}
      data-type={type}
    >
      <div className={cn("mx-auto flex items-center gap-6 px-6 py-3", innerClassName)}>
        {brand ? <div className="flex shrink-0 items-center">{brand}</div> : null}
        <div
          className={cn(
            "flex flex-1 items-center justify-center gap-1",
            animateOnChange && "transition-opacity duration-200 motion-reduce:transition-none",
            minimized && "pointer-events-none w-0 flex-none overflow-hidden opacity-0",
            listClassName,
          )}
        >
          {children}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </nav>
  );
}
