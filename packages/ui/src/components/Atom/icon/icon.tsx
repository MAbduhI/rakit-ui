import { cva, type VariantProps } from "class-variance-authority";
import type { SVGAttributes } from "react";
import { cn } from "../../../utils";
import type { IconName } from "./icon-name";
import { iconRegistry } from "./icon-registry";

/*
 * Sizes are CSS width/height, not the underlying `size` attribute — a class
 * beats the SVG's width/height attributes, so `className` can still override
 * the variant. Colour comes from `currentColor`: set `text-accent` on the icon
 * or on any ancestor.
 */
const iconVariants = cva("inline-block shrink-0", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-7",
      "2xl": "size-8",
      "3xl": "size-10",
      "4xl": "size-12",
      "5xl": "size-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name">, VariantProps<typeof iconVariants> {
  name: IconName;
}

export function Icon({ name, size, className, ...props }: IconProps) {
  const TablerIcon = iconRegistry[name];

  return <TablerIcon aria-hidden className={cn(iconVariants({ size }), className)} stroke={1.75} {...props} />;
}
