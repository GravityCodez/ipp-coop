import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppShell, Card, PageHeader, Status } from "@/components/AppShell";
import { PLACEMENT_STATUS, facultyApplicationRecords, useIppData } from "@/lib/ipp-store";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Reviewer applications · IPP" },
      {
        name: "description",
        content:
          "Read-only Faculty Reviewer view of student internship applications in the Internship Practicum Platform demo.",
      },
      { property: "og:title", content: "Faculty Reviewer applications · IPP" },
      {
        property: "og:description",
        content:
          "Read-only Faculty Reviewer view of student internship applications in the Internship Practicum Platform demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FacultyPage,
});

function FacultyPage() {
  const data = useIppData();
  const fac = data?.faculty[0];
  const records = data ? facultyApplicationRecords(data) : [];

  return (
    <AppShell>
      <PageHeader
        title="Faculty Reviewer"
        subtitle={`Simulated as ${fac?.faculty_id ?? "FAC-001"} (${fac?.display_name ?? "Synthetic Faculty Reviewer"}). This view is read-only.`}
      />
      {!data ? (
        <p role="status">Loading applications…</p>
      ) : (
        <Card title="Applications">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Status>Read-only</Status>
            <span className="text-sm text-muted-foreground">
              Viewing a record does not approve a placement.
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Application status and placement status are two separate values: an application marked
            "Submitted" is not a confirmed placement. Placement status is never stored in this demo
            and is always shown as "{PLACEMENT_STATUS}".
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            {records.length} application{records.length === 1 ? "" : "s"} on record.
          </p>
          {records.length === 0 ? (
            <p
              role="status"
              className="rounded-xl border border-dashed border-border p-4 text-muted-foreground"
            >
              No student applications yet. Applications appear here as soon as a student submits one
              in the Student view, each with a faculty review record marked "Available for review".
            </p>
          ) : (
            <ul className="space-y-4">
              {records.map((record) => (
                <li
                  key={record.application.application_id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold text-primary">
                      {record.opportunity?.title ??
                        `Opportunity ${record.application.opportunity_id} was not found`}
                    </h2>
                    <p className="break-words text-sm text-muted-foreground">
                      {record.organization_name}
                    </p>
                  </div>
                  <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <Field label="Student">
                      {record.student?.display_name ?? "Student profile was not found"} ·{" "}
                      {record.application.student_id}
                    </Field>
                    <Field label="Application ID">{record.application.application_id}</Field>
                    <Field label="Opportunity ID">{record.application.opportunity_id}</Field>
                    <Field label="Submitted">
                      {formatDateTime(record.application.submitted_at)}
                    </Field>
                    <Field label="Review ID">
                      {record.review?.review_id ?? "No linked review record"}
                    </Field>
                    <Field label="Review status">
                      {record.review?.review_status ?? "No linked review record"}
                    </Field>
                    <Field label="Application status">
                      <Status>{record.application.application_status}</Status>
                    </Field>
                    <Field label="Placement status">
                      <Status>{PLACEMENT_STATUS}</Status>
                    </Field>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words">{children}</dd>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
