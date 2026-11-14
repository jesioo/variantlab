import { MinusIcon, PlusIcon } from '../icons';
import type { Plan } from './plans';

interface SeatsStepperProps {
  readonly plan: Plan;
  readonly seats: number;
  readonly onSeatsChange: (seats: number) => void;
  readonly tone?: 'light' | 'dark';
}

/** Holds no state itself. Each variant keeps its own seat count, which shows state preservation. */
export function SeatsStepper({ plan, seats, onSeatsChange, tone = 'light' }: SeatsStepperProps) {
  const buttonClass =
    tone === 'light'
      ? 'text-zinc-600 enabled:hover:bg-zinc-100 enabled:hover:text-zinc-950 focus-visible:outline-zinc-900'
      : 'text-zinc-300 enabled:hover:bg-zinc-800 enabled:hover:text-white focus-visible:outline-white';

  return (
    <div
      className={`inline-flex items-center rounded-lg border ${tone === 'light' ? 'border-zinc-200' : 'border-zinc-700'}`}
    >
      <button
        type="button"
        aria-label={`Remove a seat from ${plan.name}`}
        disabled={seats <= plan.minimumSeats}
        onClick={() => {
          onSeatsChange(seats - 1);
        }}
        className={`grid size-8 place-items-center rounded-l-lg focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-40 ${buttonClass}`}
      >
        <MinusIcon className="size-3.5" />
      </button>
      <output aria-label={`${plan.name} seats`} className="w-8 text-center text-sm tabular-nums">
        {seats}
      </output>
      <button
        type="button"
        aria-label={`Add a seat to ${plan.name}`}
        onClick={() => {
          onSeatsChange(seats + 1);
        }}
        className={`grid size-8 place-items-center rounded-r-lg focus-visible:outline-2 focus-visible:-outline-offset-2 ${buttonClass}`}
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}
