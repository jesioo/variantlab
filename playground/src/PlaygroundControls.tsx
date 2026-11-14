import { useId } from 'react';
import type { VariantSelection } from 'variantlab';

interface VariantGroup {
  readonly variantsId: string;
  readonly variantNames: readonly string[];
}

interface PlaygroundControlsProps {
  readonly groups: readonly VariantGroup[];
  readonly enabled: boolean;
  readonly onEnabledChange: (enabled: boolean) => void;
  readonly selection: VariantSelection;
  readonly onSelectionChange: (selection: VariantSelection) => void;
}

/** Drives `VariantsProvider` in controlled mode. */
export function PlaygroundControls({
  groups,
  enabled,
  onEnabledChange,
  selection,
  onSelectionChange,
}: PlaygroundControlsProps) {
  const select = (groupId: string, name: string) => {
    const rest = Object.fromEntries(Object.entries(selection).filter(([id]) => id !== groupId));
    onSelectionChange(name === 'default' ? rest : { ...rest, [groupId]: name });
  };

  return (
    <section aria-label="Playground controls" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex items-center justify-between gap-8">
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
        {/* A two column grid on small screens keeps the pickers aligned, a wrapping row on large ones. */}
        <div className="grid grid-cols-[max-content_max-content] items-center gap-x-3 gap-y-2.5 lg:flex lg:flex-wrap lg:gap-x-8 lg:gap-y-3">
          {groups.map((group) => (
            <GroupPicker
              key={group.variantsId}
              group={group}
              selected={selection[group.variantsId] ?? 'default'}
              disabled={!enabled}
              onSelect={(name) => {
                select(group.variantsId, name);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface GroupPickerProps {
  readonly group: VariantGroup;
  readonly selected: string;
  readonly disabled: boolean;
  readonly onSelect: (name: string) => void;
}

function GroupPicker({ group, selected, disabled, onSelect }: GroupPickerProps) {
  const labelId = useId();

  return (
    <div className="contents lg:flex lg:items-center lg:gap-3">
      <span id={labelId} className="font-mono text-xs text-zinc-500">
        {group.variantsId}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="inline-flex rounded-lg bg-zinc-100 p-0.5"
      >
        {group.variantNames.map((name) => (
          <label
            key={name}
            className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors has-checked:bg-white has-checked:text-zinc-950 has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-zinc-900 has-enabled:hover:text-zinc-950 has-disabled:cursor-not-allowed has-disabled:opacity-50"
          >
            <input
              type="radio"
              name={group.variantsId}
              value={name}
              checked={selected === name}
              disabled={disabled}
              onChange={() => {
                onSelect(name);
              }}
              className="sr-only"
            />
            {name}
          </label>
        ))}
      </div>
    </div>
  );
}
