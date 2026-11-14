import type { ComponentType } from 'react';

/** A module whose default export is a component, as returned by `import()`. */
export interface VariantModule<P> {
  readonly default: ComponentType<P>;
}

/**
 * Loads a variant other than the default one, on demand.
 *
 * Return the module from a dynamic import, such as `() => import('./Card.compact')`,
 * or pick a named export with `() => import('./Card.compact').then((m) => m.CompactCard)`.
 */
export type VariantLoader<P> = () => Promise<VariantModule<P> | ComponentType<P>>;

/** The selected variant name of each variants group, keyed by group id. */
export type VariantSelection = Readonly<Record<string, string>>;
