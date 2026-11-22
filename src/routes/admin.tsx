import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, Grid, PageHeader, Status } from "@/components/AppShell";
import { approveOpportunity, saveData, useIppData, PLACEMENT_STATUS } from "@/lib/ipp-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "University Administrator view · IPP" },
      { name: "description", content: "University Administrator view of the Internship Practicum Platform demo." },
      { property: "og:title", content: "University Administrator view · IPP" },
      { property: "og:description", content: "University Administrator view of the Internship Practicum Platform demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const data = useIppData();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const pending = data?.opportunities.filter((o) => o.approval_status === "Pending Review") ?? [];
  const approved = data?.opportunities.filter((o) => o.approval_status === "Approved") ?? [];

  const employerName = (id: string) => data?.employers.find((e) => e.employer_id === id)?.organization_name ?? id;

  const onApprove = (opportunityId: string) => {
    if (!data) return;
    saveData(approveOpportunity(data, opportunityId));
    setConfirmation(`Opportunity ${opportunityId} was approved and is now visible to students.`);
  };

  const counts = data && [
    ["Employers", data.employers.length],
    ["Opportunities", data.opportunities.length],
    ["Students", data.students.length],
    ["Applications", data.applications.length],
    ["Faculty reviews", data.faculty_reviews.length],
  ];

  return (
    <AppShell>
      <PageHeader
        title="University Administrator"
        subtitle="Review employer-submitted opportunities before students can see them. Placement approval is out of scope."
      />
      {confirmation && (
        <p role="status" className="mb-4 rounded-lg bg-status p-3 text-status-foreground">{confirmation}</p>
      )}
      <Grid>
        <Card title="Record counts">
          <ul className="space-y-1">
            {counts?.map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></li>)}
          </ul>
        </Card>
        <Card title="Opportunities">
          <ul className="space-y-2">
            {data?.opportunities.map((o) => (
              <li key={o.opportunity_id} className="flex items-center justify-between gap-2">
                <span>{o.opportunity_id} · {o.title}</span><Status>{o.approval_status}</Status>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Review queue">
          <p className="mb-3 text-muted-foreground">
            Opportunities marked "Pending Review" wait for university approval before students can see them.
          </p>
          {pending.length === 0 ? (
            <p className="text-muted-foreground">No opportunities are waiting for review.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((o) => (
                <li key={o.opportunity_id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{o.title}</div>
                      <div className="text-xs text-muted-foreground">{employerName(o.employer_id)} · {o.opportunity_id}</div>
                    </div>
                    <Status>{o.approval_status}</Status>
                  </div>
                  <p className="mt-2 text-sm">{o.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.location} · {o.work_mode} · {o.duration}
                  </p>
                  <button
                    type="button"
                    onClick={() => onApprove(o.opportunity_id)}
                    className="mt-3 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground"
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Approved opportunities">
          <p className="mb-3 text-muted-foreground">
            "Approved" opportunities are published and visible in the Student view. Placement status is always "{PLACEMENT_STATUS}".
          </p>
          {approved.length === 0 ? (
            <p className="text-muted-foreground">No opportunities have been approved yet.</p>
          ) : (
            <ul className="space-y-3">
              {approved.map((o) => (
                <li key={o.opportunity_id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{o.title}</div>
                      <div className="text-xs text-muted-foreground">{employerName(o.employer_id)} · {o.opportunity_id}</div>
                    </div>
                    <Status>{o.approval_status}</Status>
                  </div>
                  <p className="mt-2 text-sm">{o.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {o.location} · {o.work_mode} · {o.duration}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Grid>
    </AppShell>
  );
}
