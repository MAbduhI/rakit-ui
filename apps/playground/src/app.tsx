import type { ReactNode } from "react";
import { Scratch } from "./scratch";
import { Showcase } from "./showcase";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-8">
          <h1 className="font-semibold text-2xl tracking-tight">Rakit UI Playground</h1>
          <p className="text-muted-foreground text-sm">
            Components resolve from source — save a file in <code>packages/ui/src</code> and this page hot-reloads.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <Scratch />
        <Showcase />
      </main>
    </div>
  );
}

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
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border p-6">{children}</div>
    </section>
  );
}
