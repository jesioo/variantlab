import type { VariantGroup } from './group';
import { createListeners } from './listeners';

/** Tracks which variants groups are mounted, so the panel lists only the groups on the page. */
export interface GroupRegistry {
  /** Registers one mounted instance of a group and returns the function that unregisters it. */
  readonly register: (group: VariantGroup) => () => void;
  readonly subscribe: (listener: () => void) => () => void;
  /** The mounted groups, one per id, sorted by id. */
  readonly getGroups: () => readonly VariantGroup[];
}

const NO_GROUPS: readonly VariantGroup[] = Object.freeze([]);

export function createGroupRegistry(): GroupRegistry {
  // Instances of each group, in the order the groups were first mounted.
  const instances = new Map<VariantGroup, number>();
  const reportedIds = new Set<string>();
  const listeners = createListeners();
  let groups = NO_GROUPS;

  const update = (): void => {
    const byId = new Map<string, VariantGroup>();
    for (const group of instances.keys()) {
      if (!byId.has(group.id)) byId.set(group.id, group);
    }
    groups = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
    listeners.notify();
  };

  const reportClash = (group: VariantGroup): void => {
    if (reportedIds.has(group.id)) return;
    const clashes = [...instances.keys()].some((other) => other !== group && other.id === group.id);
    if (!clashes) return;
    reportedIds.add(group.id);
    console.error(
      `[variantlab] Two different variants() groups use the id "${group.id}". Selections refer to groups by id, so give each group its own.`
    );
  };

  return {
    register(group) {
      const count = instances.get(group) ?? 0;
      instances.set(group, count + 1);
      if (count === 0) {
        reportClash(group);
        update();
      }

      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        const remaining = (instances.get(group) ?? 1) - 1;
        if (remaining > 0) {
          instances.set(group, remaining);
        } else {
          instances.delete(group);
          update();
        }
      };
    },

    subscribe: listeners.subscribe,

    getGroups: () => groups,
  };
}
