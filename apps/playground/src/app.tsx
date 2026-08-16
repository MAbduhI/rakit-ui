import { Button, useTheme } from "@rakitmimpi-ui/ui";
import { Scratch } from "./scratch";
import { Showcase } from "./showcase";

export function App() {
  return (
    <div className="min-h-screen bg-bg text-primary">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-6 px-6 py-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-2xl tracking-tight">Rakitmimpi UI Playground</h1>
            <p className="text-secondary text-sm">
              Components resolve from source — save a file in <code>packages/ui/src</code> and this page hot-reloads.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
        <Scratch />
        <Showcase />
      </main>
    </div>
  );
}

/** Flips `data-theme` on `<html>`; the choice survives a reload. */
export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="text-secondary text-sm">{theme === "system" ? `system (${resolvedTheme})` : theme}</span>
      <Button size="sm" variant="outline" onClick={toggleTheme}>
        {resolvedTheme === "dark" ? "Light" : "Dark"}
      </Button>
      <Button size="sm" variant="ghost" disabled={theme === "system"} onClick={() => setTheme("system")}>
        System
      </Button>
    </div>
  );
}
