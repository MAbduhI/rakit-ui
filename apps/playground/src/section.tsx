import type { ReactNode } from "react";

export interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Titled block used to group related examples. */
export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-lg tracking-tight">{title}</h2>
        {description ? <p className="text-secondary text-sm">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border p-6">{children}</div>
    </section>
  );
}
