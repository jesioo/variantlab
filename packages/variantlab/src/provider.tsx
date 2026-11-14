import { useMemo } from 'react';
import type { JSX, ReactNode } from 'react';

import { VariantsContext } from './context';
import type { VariantsContextValue } from './context';
import type { VariantSelection } from './types';

export interface VariantsProviderProps {
  /**
   * Opens the gate. While it is `false`, every variants group renders its default variant
   * exactly as it would without variantlab, and no other variant is ever loaded.
   */
  readonly enabled: boolean;
  /**
   * The selected variant of each group, keyed by group id. A group without an entry,
   * or with a name it does not define, renders its default variant.
   */
  readonly selection?: VariantSelection;
  readonly children?: ReactNode;
}

const NO_SELECTION: VariantSelection = Object.freeze({});

export function VariantsProvider({
  enabled,
  selection = NO_SELECTION,
  children,
}: VariantsProviderProps): JSX.Element {
  const value = useMemo<VariantsContextValue>(() => ({ enabled, selection }), [enabled, selection]);
  return <VariantsContext value={value}>{children}</VariantsContext>;
}
