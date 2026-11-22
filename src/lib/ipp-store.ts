import { useSyncExternalStore } from "react";

// All demo records live under this single localStorage key (browser-only, not shared across devices).
export const STORAGE_KEY = "ipp-master-demo-v2";
/** Applications and faculty reviews start numbering at 028 (course brief thread). */
export const ID_START = 28;
/** The simulated signed-in student. */
export const DEMO_STUDENT_ID = "COOP-B001";

export type WorkMode = "On-site" | "Hybrid" | "Remote";
export type ApprovalStatus = "Pending Review" | "Approved";

export interface Employer {
  employer_id: string;
  organization_name: string;
  hr_user_id: string;
  hr_authorized: boolean;
}
export interface Opportunity {
  opportunity_id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  work_mode: WorkMode;
  duration: string;
  approval_status: ApprovalStatus;
}
export interface Student {
  student_id: string;
  display_name: string;
  eligibility_status: "Eligible";
}
export interface Application {
  application_id: string;
  opportunity_id: string;
  student_id: string;
  application_status: "Submitted";
  submitted_at: string;
}
export interface FacultyReview {
  review_id: string;
  application_id: string;
  faculty_id: string;
  review_status: "Available for review";
}
export interface Faculty {
  faculty_id: string;
  display_name: string;
}

export interface IppData {
  employers: Employer[];
  opportunities: Opportunity[];
  students: Student[];
  applications: Application[];
  faculty_reviews: FacultyReview[];
  faculty: Faculty[];
}

/** Placement status is never stored; always displayed as this constant. */
export const PLACEMENT_STATUS = "Not placed";

export function makeSeed(): IppData {
  return {
    employers: [
      {
        employer_id: "EMP-001",
        organization_name: "Evergreen Labs",
        hr_user_id: "HR-001",
        hr_authorized: true,
      },
      {
        employer_id: "EMP-002",
        organization_name: "Northstar Analytics",
        hr_user_id: "HR-002",
        hr_authorized: true,
      },
    ],
    opportunities: [
      {
        opportunity_id: "OP-026",
        employer_id: "EMP-001",
        title: "Product Design Intern",
        description:
          "Synthetic description: support the design team on user research and prototyping.",
        location: "Boston, MA",
        work_mode: "Hybrid",
        duration: "12 weeks",
        approval_status: "Approved",
      },
      {
        opportunity_id: "OP-027",
        employer_id: "EMP-002",
        title: "Data Analytics Intern",
        description: "Synthetic description: help analysts clean data and build dashboards.",
        location: "Cambridge, MA",
        work_mode: "On-site",
        duration: "10 weeks",
        approval_status: "Approved",
      },
    ],
    students: [{ student_id: "COOP-B001", display_name: "Layla Hassan", eligibility_status: "Eligible" }],
    applications: [],
    faculty_reviews: [],
    faculty: [{ faculty_id: "FAC-001", display_name: "Synthetic Faculty Reviewer" }],
  };
}

/** Next unused zero-padded ID for a prefix, e.g. nextId("OPP", ["OP-026"]) => "OP-027". */
export function nextId(prefix: string, existing: string[], start = 1): string {
  const max = existing.reduce((m, id) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
    return match ? Math.max(m, Number(match[1])) : m;
  }, 0);
  return `${prefix}-${String(Math.max(max + 1, start)).padStart(3, "0")}`;
}

let cache: IppData | null = null;
const listeners = new Set<() => void>();

function load(): IppData {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as IppData) : null;
  } catch {
    cache = null;
  }
  if (!cache) {
    cache = makeSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
  return cache;
}

export function saveData(data: IppData) {
  cache = data;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  listeners.forEach((l) => l());
}

export function resetDemo() {
  saveData(makeSeed());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Returns null during SSR / before hydration. */
export function useIppData(): IppData | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

export interface OpportunityInput {
  organization_name: string;
  title: string;
  description: string;
  location: string;
  work_mode: string;
  duration: string;
}
export const WORK_MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

/** Returns field -> message for blank/whitespace-only or invalid values. */
export function validateOpportunity(
  input: OpportunityInput,
): Partial<Record<keyof OpportunityInput, string>> {
  const errors: Partial<Record<keyof OpportunityInput, string>> = {};
  const labels: Record<keyof OpportunityInput, string> = {
    organization_name: "Organization name",
    title: "Title",
    description: "Description",
    location: "Location",
    work_mode: "Work mode",
    duration: "Duration",
  };
  (Object.keys(labels) as (keyof OpportunityInput)[]).forEach((k) => {
    if (!input[k] || !input[k].trim()) errors[k] = `${labels[k]} is required.`;
  });
  if (!errors.work_mode && !WORK_MODES.includes(input.work_mode as WorkMode))
    errors.work_mode = "Choose On-site, Hybrid or Remote.";
  return errors;
}

/** Pure: returns new data plus the created opportunity. Reuses employer by case-insensitive trimmed name. */
export function addOpportunity(
  data: IppData,
  input: OpportunityInput,
): { data: IppData; opportunity: Opportunity } {
  const orgName = input.organization_name.trim();
  let employers = data.employers;
  let employer = employers.find(
    (e) => e.organization_name.trim().toLowerCase() === orgName.toLowerCase(),
  );
  if (!employer) {
    employer = {
      employer_id: nextId(
        "EMP",
        employers.map((e) => e.employer_id),
      ),
      organization_name: orgName,
      hr_user_id: nextId(
        "HR",
        employers.map((e) => e.hr_user_id),
      ),
      hr_authorized: true,
    };
    employers = [...employers, employer];
  }
  const opportunity: Opportunity = {
    opportunity_id: nextId(
      "OP",
      data.opportunities.map((o) => o.opportunity_id),
    ),
    employer_id: employer.employer_id,
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    work_mode: input.work_mode as WorkMode,
    duration: input.duration.trim(),
    approval_status: "Pending Review",
  };
  return {
    data: { ...data, employers, opportunities: [...data.opportunities, opportunity] },
    opportunity,
  };
}

/** Pure: returns new data with the given opportunity's approval_status set to "Approved"; its opportunity_id and other fields are untouched. */
export function approveOpportunity(data: IppData, opportunityId: string): IppData {
  return {
    ...data,
    opportunities: data.opportunities.map((o) =>
      o.opportunity_id === opportunityId
        ? { ...o, approval_status: "Approved" as ApprovalStatus }
        : o,
    ),
  };
}

/** Search only published opportunities, using the linked employer's name. */
export function searchApprovedOpportunities(data: IppData, query: string): Opportunity[] {
  const term = query.trim().toLowerCase();
  return data.opportunities.filter((opportunity) => {
    const organization =
      data.employers.find((e) => e.employer_id === opportunity.employer_id)?.organization_name ??
      "";
    return (
      opportunity.approval_status === "Approved" &&
      (opportunity.title.toLowerCase().includes(term) || organization.toLowerCase().includes(term))
    );
  });
}

/** Pure, atomic creation of the application and its faculty handoff. */
export function submitApplication(
  data: IppData,
  opportunityId: string,
  studentId: string,
): IppData {
  const opportunity = data.opportunities.find((o) => o.opportunity_id === opportunityId);
  if (!opportunity || opportunity.approval_status !== "Approved")
    throw new Error("Only approved opportunities accept applications.");
  if (!data.students.some((s) => s.student_id === studentId))
    throw new Error("Student profile was not found.");
  if (!data.faculty.some((f) => f.faculty_id === "FAC-001"))
    throw new Error("Faculty reviewer was not found.");
  if (
    data.applications.some((a) => a.student_id === studentId && a.opportunity_id === opportunityId)
  ) {
    throw new Error("Application submitted. You cannot apply to the same opportunity twice.");
  }
  const application: Application = {
    application_id: nextId(
      "APP",
      data.applications.map((a) => a.application_id),
      ID_START,
    ),
    opportunity_id: opportunityId,
    student_id: studentId,
    application_status: "Submitted",
    submitted_at: new Date().toISOString(),
  };
  const review: FacultyReview = {
    review_id: nextId(
      "REV",
      data.faculty_reviews.map((r) => r.review_id),
      ID_START,
    ),
    application_id: application.application_id,
    faculty_id: "FAC-001",
    review_status: "Available for review",
  };
  return {
    ...data,
    applications: [...data.applications, application],
    faculty_reviews: [...data.faculty_reviews, review],
  };
}

export function updateStudentDisplayName(data: IppData, studentId: string, name: string): IppData {
  const displayName = name.trim();
  if (!displayName)
    throw new Error("Enter a nonblank display name. Your previous name has not changed.");
  if (!data.students.some((s) => s.student_id === studentId))
    throw new Error("Student profile was not found.");
  return {
    ...data,
    students: data.students.map((s) =>
      s.student_id === studentId ? { ...s, display_name: displayName } : s,
    ),
  };
}

/** Joined read model for the read-only Faculty view; nothing here is stored separately. */
export interface FacultyApplicationRecord {
  application: Application;
  student: Student | undefined;
  opportunity: Opportunity | undefined;
  organization_name: string;
  review: FacultyReview | undefined;
}

/** Pure: every stored application joined to its student, opportunity, employer and faculty review. Changes nothing. */
export function facultyApplicationRecords(data: IppData): FacultyApplicationRecord[] {
  return data.applications.map((application) => {
    const opportunity = data.opportunities.find(
      (o) => o.opportunity_id === application.opportunity_id,
    );
    return {
      application,
      student: data.students.find((s) => s.student_id === application.student_id),
      opportunity,
      organization_name: opportunity
        ? (data.employers.find((e) => e.employer_id === opportunity.employer_id)
            ?.organization_name ?? opportunity.employer_id)
        : "Unavailable",
      review: data.faculty_reviews.find((r) => r.application_id === application.application_id),
    };
  });
}
