"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlannerRecord, RiskProfile } from "@/lib/planner/types";

type FormState = {
  age: string;
  annual_income: string;
  monthly_savings: string;
  current_savings: string;
  target_retirement_age: string;
  risk_profile: RiskProfile;
};

const defaultForm: FormState = {
  age: "35",
  annual_income: "80000",
  monthly_savings: "500",
  current_savings: "20000",
  target_retirement_age: "65",
  risk_profile: "moderate",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function fromPlan(record: PlannerRecord | null): FormState {
  if (!record?.plan_input) return defaultForm;

  return {
    age: String(record.plan_input.age),
    annual_income: String(record.plan_input.annual_income),
    monthly_savings: String(record.plan_input.monthly_savings),
    current_savings: String(record.plan_input.current_savings),
    target_retirement_age: String(record.plan_input.target_retirement_age),
    risk_profile: record.plan_input.risk_profile,
  };
}

function labelFromKey(key: keyof FormState) {
  return {
    age: "Age",
    annual_income: "Annual income",
    monthly_savings: "Monthly savings",
    current_savings: "Current savings",
    target_retirement_age: "Target retirement age",
    risk_profile: "Risk profile",
  }[key];
}

export function PlannerApp() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [record, setRecord] = useState<PlannerRecord | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [message, setMessage] = useState("");
  const [lead, setLead] = useState({ name: "", email: "" });

  useEffect(() => {
    let mounted = true;

    async function loadDemo() {
      try {
        const response = await fetch("/api/demo", { cache: "no-store" });
        const payload = await response.json();
        if (!mounted) return;

        if (!response.ok) throw new Error(payload.error);
        if (!payload.data) {
          setLoadState("empty");
          return;
        }

        setRecord(payload.data);
        setForm(fromPlan(payload.data));
        setLoadState("ready");
      } catch {
        if (mounted) setLoadState("error");
      }
    }

    loadDemo();
    return () => {
      mounted = false;
    };
  }, []);

  const clientErrors = useMemo(() => validateClientForm(form), [form]);
  const projection = record?.projection;
  const planInputId = record?.plan_input?.id;

  async function submitPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFieldErrors(clientErrors);

    if (Object.keys(clientErrors).length) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          annual_income: Number(form.annual_income),
          monthly_savings: Number(form.monthly_savings),
          current_savings: Number(form.current_savings),
          target_retirement_age: Number(form.target_retirement_age),
          risk_profile: form.risk_profile,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setFieldErrors(payload.errors || {});
        throw new Error(payload.error || "Plan failed.");
      }

      setRecord(payload.data);
      setFieldErrors({});
      setLoadState("ready");
      setMessage("Your plan is saved and the dashboard has been updated.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLeadErrors({});
    setIsSavingLead(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, plan_input_id: planInputId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setLeadErrors(payload.errors || {});
        throw new Error(payload.error || "Lead failed.");
      }

      setLead({ name: "", email: "" });
      setMessage("Saved. Your results are attached to that email.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSavingLead(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#1f2933]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[400px_1fr] lg:px-8">
        <section className="self-start rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1f7a65]">
              My Financial Planner
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#14213d]">
              Run a retirement plan in under 30 seconds.
            </h1>
          </div>

          <form className="space-y-4" onSubmit={submitPlan} noValidate>
            {(
              [
                "age",
                "annual_income",
                "monthly_savings",
                "current_savings",
                "target_retirement_age",
              ] as Array<keyof FormState>
            ).map((key) => (
              <label className="block" key={key}>
                <span className="text-sm font-medium text-[#344054]">{labelFromKey(key)}</span>
                <input
                  className="mt-1 w-full rounded-md border border-[#c9c1b1] bg-white px-3 py-2 text-base outline-none transition focus:border-[#1f7a65] focus:ring-2 focus:ring-[#1f7a65]/20"
                  inputMode="numeric"
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  aria-invalid={Boolean(fieldErrors[key])}
                />
                {fieldErrors[key] ? (
                  <span className="mt-1 block text-sm text-[#b42318]">{fieldErrors[key]}</span>
                ) : null}
              </label>
            ))}

            <label className="block">
              <span className="text-sm font-medium text-[#344054]">Risk profile</span>
              <select
                className="mt-1 w-full rounded-md border border-[#c9c1b1] bg-white px-3 py-2 text-base outline-none transition focus:border-[#1f7a65] focus:ring-2 focus:ring-[#1f7a65]/20"
                value={form.risk_profile}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    risk_profile: event.target.value as RiskProfile,
                  }))
                }
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </label>

            <button
              className="w-full rounded-md bg-[#14213d] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#24375d] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Running plan..." : "Run My Plan"}
            </button>
          </form>

          <form className="mt-6 border-t border-[#e4ded2] pt-5" onSubmit={saveLead} noValidate>
            <h2 className="text-lg font-semibold text-[#14213d]">Save my results</h2>
            <div className="mt-3 grid gap-3">
              <label className="block">
                <span className="text-sm font-medium text-[#344054]">Name</span>
                <input
                  className="mt-1 w-full rounded-md border border-[#c9c1b1] px-3 py-2 text-base outline-none focus:border-[#1f7a65] focus:ring-2 focus:ring-[#1f7a65]/20"
                  value={lead.name}
                  onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))}
                />
                {leadErrors.name ? <span className="mt-1 block text-sm text-[#b42318]">{leadErrors.name}</span> : null}
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#344054]">Email</span>
                <input
                  className="mt-1 w-full rounded-md border border-[#c9c1b1] px-3 py-2 text-base outline-none focus:border-[#1f7a65] focus:ring-2 focus:ring-[#1f7a65]/20"
                  type="email"
                  value={lead.email}
                  onChange={(event) => setLead((current) => ({ ...current, email: event.target.value }))}
                />
                {leadErrors.email ? (
                  <span className="mt-1 block text-sm text-[#b42318]">{leadErrors.email}</span>
                ) : null}
              </label>
              <button
                className="rounded-md border border-[#1f7a65] px-4 py-2 font-semibold text-[#155f4e] transition hover:bg-[#e7f4ef] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSavingLead || !planInputId}
                type="submit"
              >
                {isSavingLead ? "Saving..." : "Save My Results"}
              </button>
            </div>
          </form>

          {message ? (
            <p className="mt-4 rounded-md bg-[#edf7f3] px-3 py-2 text-sm font-medium text-[#155f4e]">
              {message}
            </p>
          ) : null}
        </section>

        <section className="space-y-5">
          {loadState === "loading" || isSubmitting ? <LoadingState /> : null}
          {loadState === "error" ? <StateMessage title="Something went wrong" detail="Please try again." /> : null}
          {loadState === "empty" ? (
            <StateMessage title="No plan yet" detail="Enter your details to start." />
          ) : null}
          {projection && loadState === "ready" && !isSubmitting ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Metric label="Retirement readiness" value={`${Math.round(projection.retirement_score)} / 100`} />
                <Metric label="Projected balance" value={currency.format(projection.projected_balance)} />
                <Metric
                  label={projection.monthly_gap >= 0 ? "Monthly surplus" : "Monthly shortfall"}
                  value={`${projection.monthly_gap >= 0 ? "+" : ""}${currency.format(projection.monthly_gap)}`}
                />
              </div>

              <div className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold text-[#14213d]">Projected balance</h2>
                    <p className="text-sm text-[#667085]">
                      From age {record?.plan_input.age} to {record?.plan_input.target_retirement_age}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf7f3] px-3 py-1 text-sm font-semibold text-[#155f4e]">
                    {record?.plan_input.risk_profile}
                  </span>
                </div>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer>
                    <AreaChart data={projection.balance_curve} margin={{ left: 4, right: 12, top: 12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balance" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#1f7a65" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#1f7a65" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e4ded2" strokeDasharray="3 3" />
                      <XAxis dataKey="age" tickLine={false} />
                      <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} tickLine={false} />
                      <Tooltip formatter={(value) => currency.format(Number(value))} labelFormatter={(age) => `Age ${age}`} />
                      <Area dataKey="balance" fill="url(#balance)" stroke="#1f7a65" strokeWidth={3} type="monotone" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {record?.recommendations.map((recommendation) => (
                  <article className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm" key={recommendation.id}>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-[#14213d]">{recommendation.title}</h3>
                      <span className="shrink-0 rounded-full bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#475467]">
                        {recommendation.source === "openai-gpt4o" ? "AI" : "Rule-based"}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-[#475467]">{recommendation.detail}</p>
                    <p className="mt-3 text-sm font-medium text-[#155f4e]">{recommendation.value}</p>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function validateClientForm(form: FormState) {
  const errors: Record<string, string> = {};
  const age = Number(form.age);
  const targetAge = Number(form.target_retirement_age);

  if (!Number.isInteger(age) || age < 18 || age > 80) errors.age = "Enter an age between 18 and 80.";
  if (!Number(form.annual_income) || Number(form.annual_income) <= 0) errors.annual_income = "Enter your annual income.";
  if (form.monthly_savings === "" || Number(form.monthly_savings) < 0) errors.monthly_savings = "Enter monthly savings.";
  if (form.current_savings === "" || Number(form.current_savings) < 0) errors.current_savings = "Enter current savings.";
  if (!Number.isInteger(targetAge) || targetAge <= age || targetAge > 85) {
    errors.target_retirement_age = "Choose a retirement age after your current age.";
  }

  return errors;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d8d1c2] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-[#14213d]">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="h-28 animate-pulse rounded-lg bg-white" key={item} />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-lg bg-white" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg bg-white" />
        <div className="h-40 animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  );
}

function StateMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-[#d8d1c2] bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-[#14213d]">{title}</h2>
      <p className="mt-2 text-[#667085]">{detail}</p>
    </div>
  );
}
