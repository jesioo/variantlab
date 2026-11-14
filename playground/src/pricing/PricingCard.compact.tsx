import { useState } from 'react';

import { formatPrice } from './plans';
import type { PricingCardProps } from './plans';
import { SeatsStepper } from './SeatsStepper';

export default function PricingCardCompact({ plan }: PricingCardProps) {
  const [seats, setSeats] = useState(plan.minimumSeats);

  return (
    <article
      aria-label={plan.name}
      data-variant="compact"
      className="flex w-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-950">
          {plan.name}
          {plan.featured && (
            <span className="ml-2 text-xs font-medium text-emerald-700">Popular</span>
          )}
        </h2>
        <p className="text-sm text-zinc-500">
          <span className="font-semibold text-zinc-950 tabular-nums">
            {formatPrice(plan.pricePerSeat)}
          </span>{' '}
          per seat
        </p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs whitespace-nowrap text-zinc-700"
          >
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <SeatsStepper plan={plan} seats={seats} onSeatsChange={setSeats} />
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          Choose <span className="sr-only">{plan.name}</span>
        </button>
      </div>
    </article>
  );
}
