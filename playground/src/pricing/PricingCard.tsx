import { variants } from 'variantlab';

import { PricingCardCurrent } from './PricingCard.current';

export const PricingCard = variants('pricing-card', {
  default: PricingCardCurrent,
  compact: () => import('./PricingCard.compact'),
  spotlight: () => import('./PricingCard.spotlight'),
});
