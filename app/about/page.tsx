export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] px-4 py-10 text-[#1f2933] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <a className="text-sm font-semibold text-[#155f4e]" href="/">
          Back to planner
        </a>
        <h1 className="mt-6 text-4xl font-semibold tracking-normal text-[#14213d]">
          My Financial Planner case study
        </h1>
        <div className="mt-8 space-y-6 text-base leading-7 text-[#475467]">
          <section>
            <h2 className="text-2xl font-semibold text-[#14213d]">Problem</h2>
            <p className="mt-2">
              Retirement planning tools often hide the useful answer behind logins, jargon, or static calculators.
              This app gives visitors a saved projection, readiness score, chart, and recommendation list without
              asking them to create an account first.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#14213d]">Product Decisions</h2>
            <p className="mt-2">
              The homepage is the product, not a marketing page. A seeded demo plan loads first, then every form
              writes to Supabase and refreshes the visible dashboard so buttons always produce durable state.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#14213d]">Stack</h2>
            <p className="mt-2">
              Next.js App Router handles the UI and server routes, Supabase stores plans, projections,
              recommendations, leads, and audit events, Recharts renders the balance curve, and OpenAI enriches
              recommendation text with a rule-based fallback.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#14213d]">Success Scenario</h2>
            <p className="mt-2">
              A visitor opens the app, edits the pre-loaded numbers, runs a plan, sees the score and chart, reviews
              ranked recommendations, and saves their email in less than 30 seconds.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
