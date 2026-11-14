// Type level tests. `pnpm typecheck` checks them, Vitest does not run them.
import type { ComponentProps, JSX } from 'react';
import { expectTypeOf } from 'vitest';

import { variants } from './index';

interface CardProps {
  readonly plan: string;
  readonly seats?: number;
}

declare function Card(props: CardProps): JSX.Element;
declare function CompactCard(props: CardProps): JSX.Element;
declare function MinimalCard(props: { readonly plan: string }): JSX.Element;
declare function NeedsExtraProp(props: CardProps & { readonly badge: string }): JSX.Element;

// The group component takes the default variant's props, and knows every variant name.
const Group = variants('card', {
  default: Card,
  compact: () => Promise.resolve({ default: CompactCard }),
  minimal: () => Promise.resolve(MinimalCard),
});
expectTypeOf<ComponentProps<typeof Group>>().toEqualTypeOf<CardProps>();
expectTypeOf(Group.variantNames).toEqualTypeOf<readonly ('default' | 'compact' | 'minimal')[]>();

variants('card', {
  default: Card,
  // @ts-expect-error Every variant has to accept the default variant's props.
  extra: () => Promise.resolve({ default: NeedsExtraProp }),
});

variants('card', {
  default: Card,
  // @ts-expect-error Variants other than the default one are loaded lazily.
  compact: CompactCard,
});

// @ts-expect-error A group needs a default variant.
variants('card', { compact: () => Promise.resolve({ default: CompactCard }) });
