# variantlab

Switch between variants of a React component live in the browser.

variantlab is for developers and designers who want to compare variants of a component inside the real app, on real data, instead of in isolation.
Variants are meant to be short-lived.
Try a few, pick a winner, delete the rest.

variantlab is in early development.
Everything below works today.
Persisted selections, shareable links and the switcher panel are not built yet.

## Install

```sh
pnpm add variantlab
```

variantlab needs React 19.2 or newer.

## Declare variants

```tsx
// PricingCard.tsx
import { variants } from 'variantlab';

import { PricingCardCurrent } from './PricingCard.current';

export const PricingCard = variants('pricing-card', {
  default: PricingCardCurrent,
  compact: () => import('./PricingCard.compact'),
  spotlight: () => import('./PricingCard.spotlight').then((m) => m.Spotlight),
});
```

Call sites do not change: `<PricingCard plan={plan} />`.

- The default variant is imported statically and renders for everyone outside an open gate.
- Every other variant is a separate lazily loaded chunk, fetched only once it is selected.
- TypeScript checks that every variant accepts the default variant's props.
- The id ends up in selections and links, so keep it stable.

## Open the gate

```tsx
import { VariantsProvider } from 'variantlab';

<VariantsProvider enabled={isInternalUser} selection={{ 'pricing-card': 'compact' }}>
  <App />
</VariantsProvider>;
```

- While `enabled` is `false`, every group renders its default variant exactly as it would without variantlab, and no variant code is loaded.
- Outside any `VariantsProvider`, every group renders its default variant.
- `selection` maps group ids to variant names.
  Unknown groups and names fall back to the default variant.
  Tests and Storybook can drive it directly.

## Behavior

- Every instance of a group switches at once.
- While a selected variant loads, the current one stays on screen.
- The previous variant stays mounted but hidden, so switching back keeps its state.
- A variant that throws while rendering is replaced by the default variant, and the error is logged.

## Promote a winner

Replace the `variants()` call with a plain export of the winning component, then delete the other variant files.

## License

MIT
