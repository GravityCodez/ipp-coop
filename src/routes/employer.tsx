import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell, Card, Grid, PageHeader, Status } from "@/components/AppShell";
import {
  addOpportunity,
  saveData,
  useIppData,
  validateOpportunity,
  WORK_MODES,
  type OpportunityInput,
} from "@/lib/ipp-store";

export const Route = createFileRoute("/employer")({
  head: () => ({
    meta: [
      { title: "Employer HR view · IPP" },
      { name: "description", content: "Employer HR view of the Internship Practicum Platform demo." },
      { property: "og:title", content: "Employer HR view · IPP" },
      { property: "og:description", content: "Employer HR view of the Internship Practicum Platform demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmployerPage,
});

const EMPTY: OpportunityInput = { organization_name: "", title: "", description: "", location: "", work_mode: "", duration: "" };
const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";

function EmployerPage() {
  const data = useIppData();
  const [form, setForm] = useState<OpportunityInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof OpportunityInput, string>>>({});
  const [authorized, setAuthorized] = useState(true);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const set = (k: keyof OpportunityInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!data || !authorized) return;
    const errs = validateOpportunity(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setConfirmation(null);
      return;
    }
    const result = addOpportunity(data, form);
    saveData(result.data);
    setConfirmation(`Opportunity ${result.opportunity.opportunity_id} was submitted and now waits for university review.`);
    setForm(EMPTY);
  };

  const field = (k: keyof OpportunityInput, label: string, textarea = false) => (
    <div>
      <label htmlFor={k} className="mb-1 block font-medium">{label}</label>
      {textarea ? (
        <textarea id={k} rows={3} className={inputCls} value={form[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
      ) : (
        <input id={k} className={inputCls} value={form[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
      )}
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  const employerName = (id: string) => data?.employers.find((e) => e.employer_id === id)?.organization_name ?? id;

  return (
    <AppShell>
      <PageHeader title="Employer HR" subtitle="HR authorization shown here is simulated, not real authentication." />
      <Grid>
        <Card title="Post an opportunity">
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {field("organization_name", "Organization name")}
            {field("title", "Title")}
            {field("description", "Description", true)}
            {field("location", "Location")}
            <div>
              <label htmlFor="work_mode" className="mb-1 block font-medium">Work mode</label>
              <select id="work_mode" className={inputCls} value={form.work_mode} onChange={(e) => set("work_mode", e.target.value)} aria-invalid={!!errors.work_mode}>
                <option value="">Select…</option>
                {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.work_mode && <p className="mt-1 text-xs text-destructive">{errors.work_mode}</p>}
            </div>
            {field("duration", "Duration")}
            <div className="rounded-lg border border-border bg-muted p-3">
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} />
                Simulate an authorized HR representative
              </label>
              <p className="mt-1 text-xs text-muted-foreground">Demo simulation only — this is not production access control.</p>
            </div>
            {!authorized && (
              <p className="text-xs text-destructive">Submission is disabled because the HR representative is not authorized (simulated).</p>
            )}
            <button type="submit" disabled={!authorized || !data} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">
              Submit opportunity
            </button>
            {confirmation && <p role="status" className="rounded-lg bg-status p-3 text-status-foreground">{confirmation}</p>}
          </form>
        </Card>
        <Card title="Submitted opportunities">
          <p className="mb-3 text-muted-foreground">
            "Pending Review" opportunities await university approval. "Approved" opportunities are visible to students.
          </p>
          <ul className="space-y-2">
            {data?.opportunities.map((o) => (
              <li key={o.opportunity_id} className="flex items-start justify-between gap-2 border-b border-border pb-2 last:border-0">
                <div>
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-muted-foreground">{employerName(o.employer_id)} · {o.opportunity_id}</div>
                </div>
                <Status>{o.approval_status}</Status>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </AppShell>
  );
}
