import { createContext } from 'react';
import type { Context } from 'react';

import type { GroupRegistry } from './registry';
import type { VariantSelection } from './types';

export interface VariantsContextValue {
  readonly enabled: boolean;
  readonly selection: VariantSelection;
  readonly registry: GroupRegistry;
}

/** `null` outside a `VariantsProvider`, where every group renders its default variant. */
export const VariantsContext: Context<VariantsContextValue | null> =
  createContext<VariantsContextValue | null>(null);
