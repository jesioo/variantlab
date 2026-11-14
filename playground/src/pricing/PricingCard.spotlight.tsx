import { useState } from 'react';

import { CheckIcon } from '../icons';
import { formatPrice } from './plans';
import type { PricingCardProps } from './plans';
import { SeatsStepper } from './SeatsStepper';

/** Puts the featured plan on a dark surface and keeps the other plans quiet. */
export default function PricingCardSpotlight({ plan }: PricingCardProps) {
  const [seats, setSeats] = useState(plan.minimumSeats);
  const dark = plan.featured;

  return (
    <article
      aria-label={plan.name}
      data-variant="spotlight"
      className={`flex w-full flex-col rounded-2xl border p-6 ${dark ? 'border-zinc-950 bg-zinc-950 text-white shadow-xl shadow-zinc-950/20' : 'border-zinc-200 bg-white'}`}
    >
      <h2 className={`text-sm font-medium ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
        {plan.name}
      </h2>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={`text-5xl font-semibold tracking-tight tabular-nums ${dark ? 'text-white' : 'text-zinc-950'}`}
        >
          {formatPrice(seats * plan.pricePerSeat)}
        </span>
        <span className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>a month</span>
      </p>
      <p className={`mt-1 text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {formatPrice(plan.pricePerSeat)} per seat
      </p>
      <ul className={`mt-6 space-y-2 text-sm ${dark ? 'text-zinc-200' : 'text-zinc-700'}`}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <CheckIcon
              className={`mt-0.5 size-4 shrink-0 ${dark ? 'text-emerald-400' : 'text-zinc-400'}`}
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-3 pt-8">
        <SeatsStepper
          plan={plan}
          seats={seats}
          onSeatsChange={setSeats}
          tone={dark ? 'dark' : 'light'}
        />
        <button
          type="button"
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? 'bg-white text-zinc-950 hover:bg-zinc-100 focus-visible:outline-white' : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200 focus-visible:outline-zinc-900'}`}
        >
          Choose <span className="sr-only">{plan.name}</span>
        </button>
      </div>
    </article>
  );
}
