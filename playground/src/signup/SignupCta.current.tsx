export function SignupCtaCurrent() {
  return (
    <section
      aria-label="Sign up"
      data-variant="default"
      className="rounded-2xl bg-zinc-900 px-6 py-12 text-center sm:px-10"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-balance text-white">
        Try every plan free for 14 days
      </h2>
      <p className="mt-2 text-sm text-balance text-zinc-300">
        No credit card needed. Invite your team on day one.
      </p>
      <button
        type="button"
        className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Start your trial
      </button>
    </section>
  );
}
