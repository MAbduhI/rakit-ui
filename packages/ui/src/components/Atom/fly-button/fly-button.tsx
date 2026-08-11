import { cn } from "../../../utils";
import { Button, type ButtonProps } from "../button";
import { FlyContainer, type FlyHorizontal, type FlyVertical } from "../fly-container";
import { Icon, type IconName } from "../icon";

export interface FlyButtonProps extends ButtonProps {
  /** Any name from the icon registry. Rendered before `children`. */
  icon?: IconName;
  vertical?: FlyVertical;
  horizontal?: FlyHorizontal;
  /** Classes for the fixed wrapper — `className` still styles the button itself. */
  containerClassName?: string;
}

export function FlyButton({
  icon,
  vertical,
  horizontal,
  containerClassName,
  className,
  children,
  size = "lg",
  ...props
}: FlyButtonProps) {
  return (
    <FlyContainer className={containerClassName} horizontal={horizontal} vertical={vertical}>
      <Button
        className={cn(
          // ponytail: `shadow-lg` is Tailwind's own shadow — there is no shadow
          // token yet. Swap it when P4 adds one.
          "rounded-full shadow-lg",
          // Icon-only stays a circle; with a label it grows into a pill.
          children ? undefined : "aspect-square p-0",
          className,
        )}
        size={size}
        {...props}
      >
        {icon ? <Icon name={icon} size={size === "sm" ? "md" : "lg"} /> : null}
        {children}
      </Button>
    </FlyContainer>
  );
}
