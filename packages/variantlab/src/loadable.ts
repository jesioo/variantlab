import type { ComponentType } from 'react';

import { createListeners } from './listeners';
import type { VariantLoader } from './types';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';

/** The lazily loaded variants of one group, shared by every mounted instance of it. */
export interface LoadableVariants<P> {
  readonly subscribe: (listener: () => void) => () => void;
  readonly getStatus: (name: string) => LoadStatus;
  /** Only valid once `getStatus(name)` is `'loaded'`. */
  readonly getComponent: (name: string) => ComponentType<P>;
  /** Starts loading a variant. Loading is attempted once per variant and page load. */
  readonly load: (name: string) => void;
}

type Entry<P> =
  | { readonly status: 'loading' | 'failed' }
  | { readonly status: 'loaded'; readonly component: ComponentType<P> };

export function createLoadableVariants<P>(
  groupId: string,
  loaders: Readonly<Record<string, VariantLoader<P>>>
): LoadableVariants<P> {
  const entries = new Map<string, Entry<P>>();
  const listeners = createListeners();

  const settle = (name: string, entry: Entry<P>): void => {
    entries.set(name, entry);
    listeners.notify();
  };

  const fail = (name: string, problem: string, ...details: unknown[]): void => {
    console.error(`[variantlab] Variant "${name}" of "${groupId}" ${problem}`, ...details);
    settle(name, { status: 'failed' });
  };

  return {
    subscribe: listeners.subscribe,

    getStatus(name) {
      return entries.get(name)?.status ?? 'idle';
    },

    getComponent(name) {
      const entry = entries.get(name);
      if (entry?.status !== 'loaded') {
        throw new Error(
          `[variantlab] Variant "${name}" of "${groupId}" rendered before it loaded.`
        );
      }
      return entry.component;
    },

    load(name) {
      const loader = Object.hasOwn(loaders, name) ? loaders[name] : undefined;
      if (loader === undefined || entries.has(name)) return;
      settle(name, { status: 'loading' });

      let pending: unknown;
      try {
        pending = loader();
      } catch (error) {
        fail(name, 'threw while starting to load.', error);
        return;
      }
      if (!isThenable(pending)) {
        fail(name, 'must be a function that returns a promise, such as () => import("./Variant").');
        return;
      }

      Promise.resolve(pending).then(
        (result: unknown) => {
          const component = toComponent<P>(result);
          if (component === null) {
            fail(
              name,
              'did not resolve to a component. Return the module from import(), or pick an export with .then((m) => m.YourComponent).',
              result
            );
          } else {
            settle(name, { status: 'loaded', component });
          }
        },
        (error: unknown) => {
          fail(name, 'failed to load.', error);
        }
      );
    },
  };
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

/** Plain function components and class components, or exotic ones such as `memo` and `forwardRef`. */
function isComponent(value: unknown): boolean {
  return (
    typeof value === 'function' ||
    (typeof value === 'object' && value !== null && '$$typeof' in value)
  );
}

function toComponent<P>(result: unknown): ComponentType<P> | null {
  const isModule = typeof result === 'object' && result !== null && !('$$typeof' in result);
  const candidate = isModule ? (result as { default?: unknown }).default : result;
  return isComponent(candidate) ? (candidate as ComponentType<P>) : null;
}
