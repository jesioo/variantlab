interface PlaygroundControlsProps {
  readonly enabled: boolean;
  readonly onEnabledChange: (enabled: boolean) => void;
}

/** Stands in for the app's own gate, such as a feature flag for internal users. */
export function PlaygroundControls({ enabled, onEnabledChange }: PlaygroundControlsProps) {
  return (
    <section aria-label="Playground controls" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <p className="text-sm font-semibold text-zinc-950">
          variantlab <span className="font-normal text-zinc-500">playground</span>
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            role="switch"
            checked={enabled}
            onChange={(event) => {
              onEnabledChange(event.target.checked);
            }}
            className="size-4 cursor-pointer accent-zinc-900"
          />
          Gate open
        </label>
      </div>
    </section>
  );
}
