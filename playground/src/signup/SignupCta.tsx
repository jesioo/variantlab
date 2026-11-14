import { variants } from 'variantlab';

import { SignupCtaCurrent } from './SignupCta.current';

export const SignupCta = variants('signup-cta', {
  default: SignupCtaCurrent,
  inline: () => import('./SignupCta.inline'),
  broken: () => import('./SignupCta.broken'),
});
