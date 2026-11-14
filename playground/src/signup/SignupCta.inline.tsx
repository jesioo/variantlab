import { useId, useState } from 'react';

export default function SignupCtaInline() {
  const [email, setEmail] = useState('');
  const emailId = useId();

  return (
    <section
      aria-label="Sign up"
      data-variant="inline"
      className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold text-zinc-950">Start a 14 day trial</h2>
        <p className="mt-1 text-sm text-zinc-600">We will email you a sign-in link.</p>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor={emailId} className="sr-only">
          Work email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none sm:w-64 sm:text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          Get started
        </button>
      </form>
    </section>
  );
}
