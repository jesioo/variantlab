import { lazy, Suspense, useMemo, useState, useSyncExternalStore } from 'react';
import type { JSX, ReactNode } from 'react';

import { VariantsContext } from './context';
import type { VariantsContextValue } from './context';
import { ErrorBoundary } from './error-boundary';
import { createGroupRegistry } from './registry';
import type { GroupRegistry } from './registry';
import type { VariantSelection, VariantsPanelPosition } from './types';

export interface VariantsProviderProps {
  /**
   * Opens the gate. While it is `false`, every variants group renders its default variant
   * exactly as it would without variantlab, no other variant is ever loaded, and the panel
   * stays hidden.
   */
  readonly enabled: boolean;
  /**
   * Controls the selected variant of each group, keyed by group id. Pair it with
   * `onSelectionChange`. Without it, the provider keeps the selection itself. A group without
   * an entry, or with a name it does not define, renders its default variant.
   */
  readonly selection?: VariantSelection;
  /** Called with the next selection whenever someone picks a variant in the panel. */
  readonly onSelectionChange?: (selection: VariantSelection) => void;
  /** The corner of the viewport that holds the panel button. Defaults to `'bottom-left'`. */
  readonly position?: VariantsPanelPosition;
  readonly children?: ReactNode;
}

const NO_SELECTION: VariantSelection = Object.freeze({});

export function VariantsProvider({
  enabled,
  selection: controlledSelection,
  onSelectionChange,
  position = 'bottom-left',
  children,
}: VariantsProviderProps): JSX.Element {
  const [registry] = useState(createGroupRegistry);
  const [ownSelection, setOwnSelection] = useState(NO_SELECTION);
  const isControlled = controlledSelection !== undefined;
  const selection = controlledSelection ?? ownSelection;

  const changeSelection = (next: VariantSelection): void => {
    if (!isControlled) setOwnSelection(next);
    onSelectionChange?.(next);
  };

  const value = useMemo<VariantsContextValue>(
    () => ({ enabled, selection, registry }),
    [enabled, selection, registry]
  );

  return (
    <VariantsContext value={value}>
      {children}
      {enabled && (
        <PanelMount
          registry={registry}
          selection={selection}
          onSelectionChange={changeSelection}
          position={position}
        />
      )}
    </VariantsContext>
  );
}

// The panel is a separate chunk, so people who never see it never download it.
const Panel = lazy(() => import('./panel/panel'));

interface PanelMountProps {
  readonly registry: GroupRegistry;
  readonly selection: VariantSelection;
  readonly onSelectionChange: (selection: VariantSelection) => void;
  readonly position: VariantsPanelPosition;
}

function PanelMount({ registry, ...props }: PanelMountProps): ReactNode {
  const groups = useSyncExternalStore(registry.subscribe, registry.getGroups, registry.getGroups);
  if (groups.length === 0) return null;

  return (
    <ErrorBoundary
      fallback={null}
      onError={(error) => {
        console.error('[variantlab] The variants panel failed, so it stays hidden.', error);
      }}
    >
      <Suspense fallback={null}>
        <Panel groups={groups} {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
