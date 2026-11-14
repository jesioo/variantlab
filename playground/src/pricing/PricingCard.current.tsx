import { useState } from 'react';

import { CheckIcon } from '../icons';
import { formatPrice } from './plans';
import type { PricingCardProps } from './plans';
import { SeatsStepper } from './SeatsStepper';

export function PricingCardCurrent({ plan }: PricingCardProps) {
  const [seats, setSeats] = useState(plan.minimumSeats);

  return (
    <article
      aria-label={plan.name}
      data-variant="default"
      className={`flex w-full flex-col rounded-2xl border bg-white p-6 ${plan.featured ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-950">{plan.name}</h2>
        {plan.featured && (
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white">
            Popular
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600">{plan.description}</p>
      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-zinc-950 tabular-nums">
          {formatPrice(plan.pricePerSeat)}
        </span>
        <span className="text-sm text-zinc-500">per seat a month</span>
      </p>
      <ul className="mt-6 space-y-2.5 text-sm text-zinc-700">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-3">
          <SeatsStepper plan={plan} seats={seats} onSeatsChange={setSeats} />
          <p className="text-sm text-zinc-600">
            <span className="font-medium text-zinc-950 tabular-nums">
              {formatPrice(seats * plan.pricePerSeat)}
            </span>{' '}
            a month
          </p>
        </div>
        <button
          type="button"
          className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${plan.featured ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'}`}
        >
          Start with {plan.name}
        </button>
      </div>
    </article>
  );
}
