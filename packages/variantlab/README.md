# variantlab

Switch between variants of a React component live in the browser.

variantlab is for developers and designers who want to compare variants of a component inside the real app, on real data, instead of in isolation.
Variants are meant to be short-lived.
Try a few, pick a winner, delete the rest.

variantlab is in early development.
Everything below works today.
Persisted selections, shareable links and keyboard shortcuts are not built yet.

## Install

```sh
pnpm add variantlab
```

variantlab needs React and React DOM 19.2 or newer.

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

<VariantsProvider enabled={isInternalUser}>
  <App />
</VariantsProvider>;
```

- While `enabled` is `false`, every group renders its default variant exactly as it would without variantlab, no variant code is loaded, and the panel stays hidden.
- Outside any `VariantsProvider`, every group renders its default variant.

## Switch variants

While the gate is open and at least one group is on the page, a round button floats in a corner of the viewport.
It opens a small panel with one row per group on the current page: the group id on the left and a dropdown with its variants on the right.

- Pick a variant and every instance of its group switches at once.
- Groups that show a variant other than the default one stand out in the list.
- Opening the panel starts loading every variant on the page, so switching feels instant.
- A dot on the button means at least one group on the page shows a variant other than the default one.
- Reset puts every group on the page back to its default variant.
- When the selected variant fails to load or render, the panel says so.
- A search field appears once the page has six groups or more.
- Escape or a click outside closes the panel.

The panel renders in a shadow root, so the app's styles never reach it and its styles never leak into the app.
It is a separate chunk that only people with an open gate download.

Pick the corner with `position`, which defaults to `'bottom-left'`.

```tsx
<VariantsProvider enabled={isInternalUser} position="bottom-right">
```

## Control the selection

By default the provider keeps the selection itself.
Pass `selection` to control it, and `onSelectionChange` to hear about picks in the panel.
Tests and Storybook can pin variants this way.

```tsx
<VariantsProvider enabled selection={{ 'pricing-card': 'compact' }}>
```

- `selection` maps group ids to variant names.
- Unknown groups and names fall back to the default variant.

## Behavior

- Every instance of a group switches at once.
- While a selected variant loads, the current one stays on screen.
- The previous variant stays mounted but hidden, so switching back keeps its state.
- A variant that fails to load or throws while rendering is replaced by the default variant, and the error is logged.
- Two different groups with the same id are reported in the console.

## Promote a winner

Replace the `variants()` call with a plain export of the winning component, then delete the other variant files.

## License

MIT
