import { useState } from 'react';
import { VariantsProvider } from 'variantlab';

import { PlaygroundControls } from './PlaygroundControls';
import { plans } from './pricing/plans';
import { PricingCard } from './pricing/PricingCard';
import { SignupCta } from './signup/SignupCta';

export function App() {
  const [enabled, setEnabled] = useState(true);

  return (
    <>
      <PlaygroundControls enabled={enabled} onEnabledChange={setEnabled} />
      <VariantsProvider enabled={enabled}>
        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <header className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-4xl">
              Plans that grow with your team
            </h1>
            <p className="mt-3 text-base text-pretty text-zinc-600">
              Every plan includes unlimited projects and a 14 day trial. Pay per seat and change the
              count at any time.
            </p>
          </header>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.id} className="flex">
                <PricingCard plan={plan} />
              </li>
            ))}
          </ul>
          <div className="mt-16">
            <SignupCta />
          </div>
        </main>
      </VariantsProvider>
    </>
  );
}
