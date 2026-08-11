import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div className={cn("rounded-md border border-border bg-surface text-primary shadow-sm", className)} {...props} />
  );
}

export interface CardExtensionProps extends CardProps {
  devider?: boolean;
}

export function CardHeader({ className, devider = false, ...props }: CardExtensionProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", devider && "border-b border-b-black", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold text-lg leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-secondary text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ devider = false, className, ...props }: CardExtensionProps) {
  return (
    <div className={cn("flex items-center p-6 pt-0", devider && "border-t border-t-black", className)} {...props} />
  );
}
