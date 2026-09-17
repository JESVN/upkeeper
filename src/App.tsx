import { copy } from "./lib/copy";

/**
 * The window shell: the title strip and the content area every panel mounts
 * into. It renders state it was given and starts nothing — no effect in this
 * tree may invoke a command on mount ([src/AGENTS.md](AGENTS.md),
 * [interaction rules](../docs/ui.md#interaction-rules)).
 */
export default function App() {
  return (
    <div className="flex h-screen flex-col bg-paper font-sans text-sm text-ink">
      <header className="flex h-9 shrink-0 items-center border-b border-rule px-4">
        <span className="font-medium">{copy.app.name}</span>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <p>{copy.shell.emptyTitle}</p>
          <p className="mt-2 text-ink-muted">{copy.shell.emptyHint}</p>
        </div>
      </main>
    </div>
  );
}
