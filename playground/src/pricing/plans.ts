export interface Plan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pricePerSeat: number;
  readonly minimumSeats: number;
  readonly features: readonly string[];
  readonly featured: boolean;
}

export interface PricingCardProps {
  readonly plan: Plan;
}

export const plans: readonly Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting organized.',
    pricePerSeat: 8,
    minimumSeats: 1,
    features: ['Unlimited projects', 'Shared inbox', 'Email support'],
    featured: false,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams that ship every week.',
    pricePerSeat: 14,
    minimumSeats: 3,
    features: [
      'Everything in Starter',
      'Roles and permissions',
      'Integrations',
      'Priority support',
    ],
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For companies with many teams.',
    pricePerSeat: 24,
    minimumSeats: 10,
    features: ['Everything in Team', 'Single sign-on', 'Audit log', 'Dedicated success manager'],
    featured: false,
  },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return currency.format(amount);
}
