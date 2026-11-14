import { createListeners } from './listeners';
import { createLoadableVariants } from './loadable';
import type { LoadableVariants } from './loadable';
import type { VariantLoader } from './types';

export const DEFAULT_VARIANT = 'default';

/** How far a variant got. The default variant is part of the page, so it is always `'ready'`. */
export type VariantStatus = 'idle' | 'loading' | 'ready' | 'failed';

/** A variants group as the panel sees it, shared by every mounted instance of the group. */
export interface VariantGroup {
  readonly id: string;
  /** Every variant name of the group, `'default'` first. */
  readonly variantNames: readonly string[];
  readonly subscribe: (listener: () => void) => () => void;
  readonly getStatus: (name: string) => VariantStatus;
  /** Starts loading every variant that has not started loading yet. */
  readonly preload: () => void;
}

/** What rendering needs on top of what the panel sees. */
export interface VariantGroupRuntime<P> extends VariantGroup {
  readonly loadable: LoadableVariants<P>;
  /** Marks a variant that threw while rendering, so the panel can point it out. */
  readonly reportRenderFailure: (name: string) => void;
}

export function createVariantGroup<P>(
  id: string,
  loaders: Readonly<Record<string, VariantLoader<P>>>
): VariantGroupRuntime<P> {
  const loadable = createLoadableVariants(id, loaders);
  const renderFailures = new Set<string>();
  const failureListeners = createListeners();

  return {
    id,
    variantNames: [DEFAULT_VARIANT, ...Object.keys(loaders)],
    loadable,

    subscribe(listener) {
      const unsubscribeLoads = loadable.subscribe(listener);
      const unsubscribeFailures = failureListeners.subscribe(listener);
      return () => {
        unsubscribeLoads();
        unsubscribeFailures();
      };
    },

    getStatus(name) {
      if (renderFailures.has(name)) return 'failed';
      if (name === DEFAULT_VARIANT) return 'ready';
      const status = loadable.getStatus(name);
      return status === 'loaded' ? 'ready' : status;
    },

    preload() {
      for (const name of Object.keys(loaders)) loadable.load(name);
    },

    reportRenderFailure(name) {
      if (renderFailures.has(name)) return;
      renderFailures.add(name);
      failureListeners.notify();
    },
  };
}
