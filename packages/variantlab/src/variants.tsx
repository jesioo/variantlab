import {
  Activity,
  createElement,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ComponentType, FunctionComponent, ReactNode } from 'react';

import { VariantsContext } from './context';
import { ErrorBoundary } from './error-boundary';
import { createVariantGroup, DEFAULT_VARIANT } from './group';
import type { GroupRegistry } from './registry';
import type { VariantLoader } from './types';

/** The props of a definition's default variant. Every other variant has to accept them too. */
export type VariantsProps<D> = D extends { readonly default: ComponentType<infer P> } ? P : never;

/** The variant names of a definition, `'default'` included. */
export type VariantName<D> = Extract<keyof D, string>;

/**
 * Checks a variants definition. `default` is a component that is imported statically, and
 * every other entry lazily loads a component that accepts the default variant's props.
 */
export type VariantsDefinition<D> = {
  readonly [K in keyof D]: K extends 'default' ? D[K] : VariantLoader<VariantsProps<D>>;
};

/** A component that renders the selected variant of its group. */
export type VariantsComponent<P, Name extends string = string> = FunctionComponent<P> & {
  /** The id that selections and shared links refer to. */
  readonly variantsId: string;
  /** Every variant name of the group, `'default'` first. */
  readonly variantNames: readonly Name[];
};

/**
 * Declares a group of variants of one component.
 *
 * The default variant renders for everyone outside an open `VariantsProvider` gate. Every
 * other variant is a separate lazily loaded chunk that is only fetched once it is selected.
 *
 * @param id A stable, unique id. It is stored in selections and shared links, so it must
 * survive minification and refactoring.
 *
 * @example
 * export const PricingCard = variants('pricing-card', {
 *   default: PricingCardCurrent,
 *   compact: () => import('./PricingCard.compact'),
 * });
 */
export function variants<D extends { readonly default: ComponentType<never> }>(
  id: string,
  definition: D & VariantsDefinition<D>
): VariantsComponent<VariantsProps<D>, VariantName<D>> {
  if (id === '') throw new TypeError('[variantlab] variants() needs a non-empty group id.');

  type P = VariantsProps<D>;
  const { default: Default, ...loaders } = definition as unknown as {
    readonly default: ComponentType<P>;
  } & Readonly<Record<string, VariantLoader<P>>>;

  return createVariants<P>(id, Default, loaders) as VariantsComponent<P, VariantName<D>>;
}

interface Shown {
  readonly current: string;
  readonly previous: string | null;
}

function createVariants<P>(
  id: string,
  Default: ComponentType<P>,
  loaders: Readonly<Record<string, VariantLoader<P>>>
): VariantsComponent<P> {
  const group = createVariantGroup(id, loaders);
  const { loadable } = group;
  const renderDefault = (props: P): ReactNode =>
    createElement(Default as ComponentType<object>, props as object);

  function LoadedVariant({ name, props }: { readonly name: string; readonly props: P }): ReactNode {
    return (
      <ErrorBoundary
        fallback={renderDefault(props)}
        onError={(error, info) => {
          console.error(
            `[variantlab] Variant "${name}" of "${id}" failed to render. Showing the default variant instead.`,
            error,
            info.componentStack
          );
          group.reportRenderFailure(name);
        }}
      >
        {createElement(loadable.getComponent(name) as ComponentType<object>, props as object)}
      </ErrorBoundary>
    );
  }

  function VariantsSwitch({
    requested,
    registry,
    props,
  }: {
    readonly requested: string;
    readonly registry: GroupRegistry;
    readonly props: P;
  }): ReactNode {
    const getStatus = () => loadable.getStatus(requested);
    const status = useSyncExternalStore(loadable.subscribe, getStatus, getStatus);

    useEffect(() => registry.register(group), [registry]);

    useEffect(() => {
      if (requested !== DEFAULT_VARIANT && status === 'idle') loadable.load(requested);
    }, [requested, status]);

    // A variant that fails to load falls back to the default one, like a variant that throws.
    const target = status === 'failed' ? DEFAULT_VARIANT : requested;
    const ready = target === DEFAULT_VARIANT || status === 'loaded';

    // The previous variant stays mounted but hidden, so flipping back keeps its state. Until the
    // requested variant has loaded, the current one stays on screen instead of a blank fallback.
    const [shown, setShown] = useState<Shown>({
      current: ready ? target : DEFAULT_VARIANT,
      previous: null,
    });
    if (ready && shown.current !== target) {
      setShown({ current: target, previous: shown.current });
    }

    const mounted = shown.previous === null ? [shown.current] : [shown.previous, shown.current];
    return mounted.map((name) => (
      <Activity key={name} mode={name === shown.current ? 'visible' : 'hidden'}>
        {name === DEFAULT_VARIANT ? (
          renderDefault(props)
        ) : (
          <LoadedVariant name={name} props={props} />
        )}
      </Activity>
    ));
  }

  function Variants(props: P): ReactNode {
    const context = useContext(VariantsContext);
    // A closed gate renders the default variant alone, with no wrappers, exactly as in production.
    if (!context?.enabled) return renderDefault(props);

    const selected = context.selection[id];
    const requested =
      selected !== undefined && Object.hasOwn(loaders, selected) ? selected : DEFAULT_VARIANT;
    return <VariantsSwitch requested={requested} registry={context.registry} props={props} />;
  }

  Variants.displayName = `Variants(${id})`;
  return Object.assign(Variants, { variantsId: id, variantNames: group.variantNames });
}
