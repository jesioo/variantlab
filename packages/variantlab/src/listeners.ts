/** Change listeners in the shape that `useSyncExternalStore` subscribes with. */
export interface Listeners {
  readonly subscribe: (listener: () => void) => () => void;
  readonly notify: () => void;
}

export function createListeners(): Listeners {
  const listeners = new Set<() => void>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    notify() {
      for (const listener of listeners) listener();
    },
  };
}
