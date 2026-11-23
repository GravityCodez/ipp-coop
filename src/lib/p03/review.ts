import { useSyncExternalStore } from "react";
import {
  approveOpportunity,
  saveData,
  validateOpportunity,
  WORK_MODES,
  type ApprovalStatus,
  type IppData,
  type Opportunity,
  type OpportunityInput,
  type WorkMode,
} from "@/lib/ipp-store";

/**
 * P03 (University staff review and publication) review layer.
 *
 * It sits beside Team 1's store and does not change its types. Team 1's `approval_status` only
 * knows "Pending Review" and "Approved", so the richer P03 state (checklist ticks, change
 * requests, versions, listing status, decision log) lives under its own localStorage key, keyed
 * by opportunity_id. The one bridge into Team 1's data is publishing: when the coordinator
 * publishes an approved version we call Team 1's approveOpportunity, so searchApprovedOpportunities
 * and the student view show it. Closing or withdrawing sets Team 1's status back to "Pending Review",
 * the only value that hides a listing from students.
 *
 * Review IDs: Team 1's faculty reviews use REV-### (three digits, starting at 028). The shared
 * database uses REV-0001 (four digits) for P03 listing reviews (INTEGRATION.md section 7), so P03
 * follows the shared database. The two formats clash in name only; they live in different records.
 */

export const P03_STORAGE_KEY = "ipp-p03-review-v1";
export const REVIEWER = "Sara Ahmed (Careers coordinator)";

export type ReviewStatus = "Pending Review" | "Changes Requested" | "Declined" | "Approved";
export type ListingStatus = "Not published" | "Published" | "Closed" | "Withdrawn";
export type EventType =
  | "Resubmitted"
  | "Changes Requested"
  | "Declined"
  | "Approved"
  | "Published"
  | "Closed"
  | "Withdrawn";

/** The fields an employer submits. Every submission and resubmission is kept as a version. */
export interface VersionSnapshot {
  version: number;
  title: string;
  description: string;
  location: string;
  work_mode: WorkMode;
  duration: string;
  submitted_at: string;
}

export interface P03Record {
  opportunity_id: string;
  review_status: ReviewStatus;
  listing_status: ListingStatus;
  version: number;
  history: VersionSnapshot[];
  /** Checklist keys the coordinator has ticked for the current version. */
  ticks: CheckKey[];
  approved_version?: number;
}

export interface P03Event {
  event_id: string;
  opportunity_id: string;
  type: EventType;
  actor: string;
  version: number;
  /** REV-0001 style. Set on review decisions (approved, changes requested). */
  review_id?: string;
  reason?: string;
  checklist?: CheckKey[];
  /** True when the coordinator started from the AI reviewer's draft reason. */
  ai_assisted?: boolean;
  at: string;
}

/** A rule the coordinator adds; the AI reviewer reads every rule on top of the five checks. */
export interface ReviewRule {
  rule_id: string;
  text: string;
  added_by: string;
  at: string;
}

export interface P03State {
  records: Record<string, P03Record>;
  events: P03Event[];
  rules?: ReviewRule[];
}

/** Team 1's data and the P03 layer, changed together by every action. */
export interface Combined {
  ipp: IppData;
  p03: P03State;
}

export const CHECKLIST = [
  {
    key: "completeness",
    label: "Complete details",
    help: "Title, description, location, work mode and duration are filled in.",
  },
  {
    key: "supervision",
    label: "Named supervisor",
    help: "A workplace supervisor or mentor is named.",
  },
  { key: "timing", label: "Clear timing", help: "A duration is given for the placement." },
  { key: "tasks", label: "Real tasks", help: "The description lists concrete tasks." },
  {
    key: "learning",
    label: "Learning relevance",
    help: "The work relates to the student's studies.",
  },
] as const;
export type CheckKey = (typeof CHECKLIST)[number]["key"];

export interface CheckHint {
  /** null means the coordinator has to judge it. */
  ok: boolean | null;
  note: string;
  /** Suggested sentence for the employer when the check fails. */
  ask?: string;
}

type Fields = Pick<Opportunity, "title" | "description" | "location" | "work_mode" | "duration">;

/** Automatic hints that help the coordinator. The coordinator still ticks every check. */
export function checklistHints(o: Fields): Record<CheckKey, CheckHint> {
  const missing = [
    ["title", o.title],
    ["description", o.description],
    ["location", o.location],
    ["work mode", o.work_mode],
    ["duration", o.duration],
  ]
    .filter(([, v]) => !String(v ?? "").trim())
    .map(([k]) => k);
  const desc = o.description ?? "";
  const supervisorNamed =
    /supervis|mentor|reports to/i.test(desc) &&
    !/to be confirmed|\btbc\b|\btbd\b|not yet/i.test(desc);
  const words = desc
    .replace(/^synthetic description:\s*/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    completeness: missing.length
      ? {
          ok: false,
          note: `Missing: ${missing.join(", ")}.`,
          ask: `Please add the ${missing.join(" and ")}.`,
        }
      : { ok: true, note: "Every field is filled in." },
    supervision: supervisorNamed
      ? { ok: true, note: "A supervisor is named in the description." }
      : {
          ok: false,
          note: "No supervisor is named yet.",
          ask: "Please name the workplace supervisor and their role.",
        },
    timing: /\d/.test(o.duration ?? "")
      ? { ok: true, note: `Duration: ${o.duration}.` }
      : {
          ok: false,
          note: "No duration is given.",
          ask: "Please give the start date and length of the placement.",
        },
    tasks:
      words >= 12
        ? { ok: true, note: "Concrete tasks are described." }
        : {
            ok: false,
            note: "The description is too short to judge the tasks.",
            ask: "Please list the main tasks the intern will do.",
          },
    learning: { ok: null, note: "Your judgement, based on the tasks." },
  };
}

// ---------- IDs ----------

/** Next review ID in the shared database format: REV-0001, REV-0002, ... */
export function nextReviewId(existing: string[]): string {
  const max = existing.reduce((m, id) => {
    const hit = /^REV-(\d{4})$/.exec(id);
    return hit ? Math.max(m, Number(hit[1])) : m;
  }, 0);
  return `REV-${String(max + 1).padStart(4, "0")}`;
}

function nextEventId(events: P03Event[]): string {
  const max = events.reduce((m, e) => {
    const hit = /^EV-(\d+)$/.exec(e.event_id);
    return hit ? Math.max(m, Number(hit[1])) : m;
  }, 0);
  return `EV-${String(max + 1).padStart(3, "0")}`;
}

// ---------- Records ----------

function snapshotOf(o: Fields, version: number, submitted_at: string): VersionSnapshot {
  return {
    version,
    title: o.title,
    description: o.description,
    location: o.location,
    work_mode: o.work_mode,
    duration: o.duration,
    submitted_at,
  };
}

/**
 * The P03 record for an opportunity Team 1's store holds but P03 has not touched yet. An Approved
 * Team 1 record is already visible to students, so it counts as published at version 1 (nothing
 * students can see disappears).
 */
function implicitRecord(o: Opportunity): P03Record {
  const approved = o.approval_status === "Approved";
  return {
    opportunity_id: o.opportunity_id,
    review_status: approved ? "Approved" : "Pending Review",
    listing_status: approved ? "Published" : "Not published",
    version: 1,
    history: [snapshotOf(o, 1, "")],
    ticks: approved ? CHECKLIST.map((c) => c.key) : [],
    ...(approved ? { approved_version: 1 } : {}),
  };
}

/**
 * A stored record is stale when Team 1's data was reset or replaced underneath it (the Reset demo
 * button only knows about Team 1's store): the opportunity's fields no longer match the record's
 * current version, or the record says published while Team 1 says not approved.
 */
function isStale(rec: P03Record, o: Opportunity): boolean {
  const cur = rec.history.find((h) => h.version === rec.version);
  if (!cur) return true;
  if (
    cur.title !== o.title ||
    cur.description !== o.description ||
    cur.location !== o.location ||
    cur.work_mode !== o.work_mode ||
    cur.duration !== o.duration
  )
    return true;
  return rec.listing_status === "Published" && o.approval_status !== "Approved";
}

/** Drops P03 records and events that no longer belong to Team 1's data. Returns the same object when nothing changed. */
export function reconcile(c: Combined): Combined {
  const records: Record<string, P03Record> = {};
  let changed = false;
  for (const [id, rec] of Object.entries(c.p03.records)) {
    const opp = c.ipp.opportunities.find((o) => o.opportunity_id === id);
    if (opp && !isStale(rec, opp)) records[id] = rec;
    else changed = true;
  }
  const events = c.p03.events.filter((e) => !!records[e.opportunity_id]);
  if (events.length !== c.p03.events.length) changed = true;
  return changed ? { ipp: c.ipp, p03: { ...c.p03, records, events } } : c;
}

export function recordFor(c: Combined, opportunityId: string): P03Record {
  const stored = c.p03.records[opportunityId];
  if (stored) return stored;
  const o = c.ipp.opportunities.find((x) => x.opportunity_id === opportunityId);
  if (!o) throw new Error(`Opportunity ${opportunityId} was not found.`);
  return implicitRecord(o);
}

function oppFor(c: Combined, opportunityId: string): Opportunity {
  const o = c.ipp.opportunities.find((x) => x.opportunity_id === opportunityId);
  if (!o) throw new Error(`Opportunity ${opportunityId} was not found.`);
  return o;
}

export function organizationName(ipp: IppData, employerId: string): string {
  return ipp.employers.find((e) => e.employer_id === employerId)?.organization_name ?? employerId;
}

function setRecord(c: Combined, rec: P03Record): Combined {
  return { ...c, p03: { ...c.p03, records: { ...c.p03.records, [rec.opportunity_id]: rec } } };
}

function addEvent(c: Combined, e: Omit<P03Event, "event_id">): Combined {
  const event_id = nextEventId(c.p03.events);
  return { ...c, p03: { ...c.p03, events: [...c.p03.events, { event_id, ...e }] } };
}

function setTeam1Status(ipp: IppData, opportunityId: string, status: ApprovalStatus): IppData {
  return {
    ...ipp,
    opportunities: ipp.opportunities.map((o) =>
      o.opportunity_id === opportunityId ? { ...o, approval_status: status } : o,
    ),
  };
}

// ---------- Read model ----------

export interface ReviewItem {
  opportunity: Opportunity;
  record: P03Record;
  organization: string;
}

export function reviewItems(c: Combined): ReviewItem[] {
  const r = reconcile(c);
  return r.ipp.opportunities.map((opportunity) => ({
    opportunity,
    record: recordFor(r, opportunity.opportunity_id),
    organization: organizationName(r.ipp, opportunity.employer_id),
  }));
}

function submittedAt(i: ReviewItem): string {
  return i.record.history.find((h) => h.version === i.record.version)?.submitted_at ?? "";
}
function idNumber(id: string): number {
  return Number(/(\d+)$/.exec(id)?.[1] ?? 0);
}

/** Oldest submission first, so the longest wait is reviewed first. Ties and unknown times fall back to ID order. */
function oldestFirst(a: ReviewItem, b: ReviewItem): number {
  const ta = submittedAt(a);
  const tb = submittedAt(b);
  if (ta && tb && ta !== tb) return ta < tb ? -1 : 1;
  return idNumber(a.opportunity.opportunity_id) - idNumber(b.opportunity.opportunity_id);
}

export const reviewQueue = (c: Combined) =>
  reviewItems(c)
    .filter(
      (i) => i.record.review_status === "Pending Review" && i.record.listing_status !== "Withdrawn",
    )
    .sort(oldestFirst);
export const readyToPublish = (c: Combined) =>
  reviewItems(c)
    .filter(
      (i) => i.record.review_status === "Approved" && i.record.listing_status === "Not published",
    )
    .sort(oldestFirst);
export const publishedListings = (c: Combined) =>
  reviewItems(c)
    .filter((i) => i.record.listing_status === "Published")
    .sort(oldestFirst);
export const changesRequested = (c: Combined) =>
  reviewItems(c)
    .filter(
      (i) =>
        i.record.review_status === "Changes Requested" && i.record.listing_status !== "Withdrawn",
    )
    .sort(oldestFirst);
export const closedListings = (c: Combined) =>
  reviewItems(c).filter(
    (i) => i.record.listing_status === "Closed" || i.record.listing_status === "Withdrawn",
  );

export const declinedListings = (c: Combined) =>
  reviewItems(c)
    .filter((i) => i.record.review_status === "Declined")
    .sort(oldestFirst);

/** The latest reason the coordinator gave for asking for changes or declining. */
export function latestChangeRequest(c: Combined, opportunityId: string): P03Event | undefined {
  return [...reconcile(c).p03.events]
    .reverse()
    .find(
      (e) =>
        e.opportunity_id === opportunityId &&
        (e.type === "Changes Requested" || e.type === "Declined"),
    );
}

export function eventsFor(c: Combined, opportunityId: string): P03Event[] {
  return reconcile(c).p03.events.filter((e) => e.opportunity_id === opportunityId);
}

/** Every decision, newest first. */
export function decisionLog(c: Combined): P03Event[] {
  return [...reconcile(c).p03.events].reverse();
}

export function listingLabel(r: P03Record): string {
  if (r.listing_status === "Withdrawn") return "Withdrawn";
  if (r.listing_status === "Closed") return "Closed";
  if (r.listing_status === "Published") return "Published";
  if (r.review_status === "Approved") return "Ready to publish";
  return r.review_status;
}

export interface FieldChange {
  field: string;
  before: string;
  after: string;
}
/** What changed between two versions of the same submission. */
export function versionChanges(
  r: P03Record,
  fromVersion: number,
  toVersion: number,
): FieldChange[] {
  const a = r.history.find((h) => h.version === fromVersion);
  const b = r.history.find((h) => h.version === toVersion);
  if (!a || !b) return [];
  const labels: [keyof VersionSnapshot, string][] = [
    ["title", "Title"],
    ["description", "Description"],
    ["location", "Location"],
    ["work_mode", "Work mode"],
    ["duration", "Duration"],
  ];
  return labels
    .filter(([k]) => String(a[k] ?? "") !== String(b[k] ?? ""))
    .map(([k, field]) => ({
      field,
      before: String(a[k] ?? "") || "(empty)",
      after: String(b[k] ?? "") || "(empty)",
    }));
}

// ---------- Actions (pure: Combined in, Combined out, throw on a refused action) ----------

export interface ActionOptions {
  now?: Date;
  reviewer?: string;
  /** Set when the reason started from the AI reviewer's draft; recorded on the event. */
  ai_assisted?: boolean;
}
const when = (o?: ActionOptions) => (o?.now ?? new Date()).toISOString();

function needReason(reason: string): string {
  const r = reason.trim();
  if (r.length < 5) throw new Error("Enter a reason the employer can act on.");
  return r;
}

function pendingRecord(c: Combined, id: string): P03Record {
  oppFor(c, id);
  const rec = recordFor(c, id);
  if (rec.listing_status === "Withdrawn") throw new Error(`${id} was withdrawn by the employer.`);
  if (rec.review_status !== "Pending Review")
    throw new Error(`Opportunity ${id} is ${rec.review_status}, not Pending Review.`);
  return rec;
}

/** Tick or untick one check for the current version. Only Pending Review items have a checklist. */
export function toggleCheck(c0: Combined, id: string, key: CheckKey): Combined {
  const c = reconcile(c0);
  const rec = pendingRecord(c, id);
  const ticks = rec.ticks.includes(key) ? rec.ticks.filter((k) => k !== key) : [...rec.ticks, key];
  return setRecord(c, { ...rec, ticks });
}

/** Sends the submission back to the employer with a reason they can see. Ticks reset for the next version. */
export function requestChanges(
  c0: Combined,
  id: string,
  reason: string,
  opts?: ActionOptions,
): Combined {
  const c = reconcile(c0);
  const rec = pendingRecord(c, id);
  const r = needReason(reason);
  const review_id = nextReviewId(c.p03.events.map((e) => e.review_id ?? ""));
  return addEvent(setRecord(c, { ...rec, review_status: "Changes Requested", ticks: [] }), {
    opportunity_id: id,
    type: "Changes Requested",
    actor: opts?.reviewer ?? REVIEWER,
    version: rec.version,
    review_id,
    reason: r,
    checklist: rec.ticks,
    ...(opts?.ai_assisted ? { ai_assisted: true } : {}),
    at: when(opts),
  });
}

/**
 * Declines the submission for good, with a reason the employer can see. Use it when no edit would
 * make the listing acceptable; otherwise request changes. Students never see it: Team 1's status
 * stays "Pending Review".
 */
export function decline(c0: Combined, id: string, reason: string, opts?: ActionOptions): Combined {
  const c = reconcile(c0);
  const rec = pendingRecord(c, id);
  const r = needReason(reason);
  const review_id = nextReviewId(c.p03.events.map((e) => e.review_id ?? ""));
  return addEvent(setRecord(c, { ...rec, review_status: "Declined" }), {
    opportunity_id: id,
    type: "Declined",
    actor: opts?.reviewer ?? REVIEWER,
    version: rec.version,
    review_id,
    reason: r,
    checklist: rec.ticks,
    ...(opts?.ai_assisted ? { ai_assisted: true } : {}),
    at: when(opts),
  });
}

// ---------- Review rules the AI reviewer reads (the Sprint 2 feedback loop) ----------

export function addRule(c: Combined, text: string, opts?: ActionOptions): Combined {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 8) throw new Error("Write the rule as a full sentence.");
  if (t.length > 300) throw new Error("Keep a rule under 300 characters.");
  const rules = c.p03.rules ?? [];
  if (rules.length >= 25) throw new Error("The demo keeps at most 25 rules. Remove one first.");
  const max = rules.reduce((m, x) => Math.max(m, Number(/(\d+)$/.exec(x.rule_id)?.[1] ?? 0)), 0);
  const rule_id = `RULE-${String(max + 1).padStart(3, "0")}`;
  const rule = { rule_id, text: t, added_by: opts?.reviewer ?? REVIEWER, at: when(opts) };
  return { ...c, p03: { ...c.p03, rules: [...rules, rule] } };
}

export function removeRule(c: Combined, ruleId: string): Combined {
  return {
    ...c,
    p03: { ...c.p03, rules: (c.p03.rules ?? []).filter((r) => r.rule_id !== ruleId) },
  };
}

/** Approves the current version. Locked until all five checks are ticked. Does not publish. */
export function approve(c0: Combined, id: string, opts?: ActionOptions): Combined {
  const c = reconcile(c0);
  const rec = pendingRecord(c, id);
  const open = CHECKLIST.filter((x) => !rec.ticks.includes(x.key));
  if (open.length)
    throw new Error(
      `Tick every check before approving. Still open: ${open.map((x) => x.label).join(", ")}.`,
    );
  const review_id = nextReviewId(c.p03.events.map((e) => e.review_id ?? ""));
  return addEvent(
    setRecord(c, { ...rec, review_status: "Approved", approved_version: rec.version }),
    {
      opportunity_id: id,
      type: "Approved",
      actor: opts?.reviewer ?? REVIEWER,
      version: rec.version,
      review_id,
      reason: "All five checks passed.",
      checklist: rec.ticks,
      ...(opts?.ai_assisted ? { ai_assisted: true } : {}),
      at: when(opts),
    },
  );
}

/** Publishes the approved version. This is the step that calls Team 1's approveOpportunity so students see it. */
export function publish(c0: Combined, id: string, opts?: ActionOptions): Combined {
  const c = reconcile(c0);
  oppFor(c, id);
  const rec = recordFor(c, id);
  if (rec.review_status !== "Approved")
    throw new Error(
      `Opportunity ${id} is ${rec.review_status}. Only approved versions can be published.`,
    );
  if (rec.listing_status === "Published")
    throw new Error(`Opportunity ${id} is already published.`);
  if (rec.listing_status === "Closed" || rec.listing_status === "Withdrawn")
    throw new Error(`Opportunity ${id} is ${rec.listing_status.toLowerCase()}.`);
  if (rec.approved_version !== rec.version)
    throw new Error(
      `Version ${rec.version} of ${id} has not been approved, so it cannot be published.`,
    );
  const next = setRecord(
    { ...c, ipp: approveOpportunity(c.ipp, id) },
    { ...rec, listing_status: "Published" },
  );
  return addEvent(next, {
    opportunity_id: id,
    type: "Published",
    actor: opts?.reviewer ?? REVIEWER,
    version: rec.version,
    at: when(opts),
  });
}

function takeDown(c: Combined, id: string, status: "Closed" | "Withdrawn"): Combined {
  const rec = recordFor(c, id);
  // Team 1 has no "closed" value; "Pending Review" is the only status its student search hides.
  return setRecord(
    { ...c, ipp: setTeam1Status(c.ipp, id, "Pending Review") },
    { ...rec, listing_status: status },
  );
}

/** The coordinator closes a published listing. Students stop seeing it. A reason is required. */
export function closeListing(
  c0: Combined,
  id: string,
  reason: string,
  opts?: ActionOptions,
): Combined {
  const c = reconcile(c0);
  const rec = recordFor(c, id);
  if (rec.listing_status !== "Published")
    throw new Error(`Only published listings can be closed. ${id} is ${listingLabel(rec)}.`);
  const r = needReason(reason);
  return addEvent(takeDown(c, id, "Closed"), {
    opportunity_id: id,
    type: "Closed",
    actor: opts?.reviewer ?? REVIEWER,
    version: rec.version,
    reason: r,
    at: when(opts),
  });
}

/** The employer withdraws a listing that is waiting, ready to publish or published. */
export function withdrawListing(
  c0: Combined,
  id: string,
  reason: string,
  opts?: ActionOptions,
): Combined {
  const c = reconcile(c0);
  const o = oppFor(c, id);
  const rec = recordFor(c, id);
  const waiting =
    rec.listing_status === "Not published" && rec.review_status !== "Changes Requested";
  if (rec.listing_status !== "Published" && !waiting)
    throw new Error(`${id} is ${listingLabel(rec)} and cannot be withdrawn.`);
  const r = needReason(reason);
  return addEvent(takeDown(c, id, "Withdrawn"), {
    opportunity_id: id,
    type: "Withdrawn",
    actor: organizationName(c.ipp, o.employer_id),
    version: rec.version,
    reason: r,
    at: when(opts),
  });
}

export type ResubmitInput = Pick<
  OpportunityInput,
  "title" | "description" | "location" | "work_mode" | "duration"
>;

/** Employer fixes a returned submission. Same opportunity ID, new version, back to Pending Review. */
export function resubmit(
  c0: Combined,
  id: string,
  input: ResubmitInput,
  opts?: ActionOptions,
): Combined {
  const c = reconcile(c0);
  const o = oppFor(c, id);
  const rec = recordFor(c, id);
  if (rec.review_status !== "Changes Requested")
    throw new Error("Only opportunities with changes requested can be resubmitted.");
  const errors = validateOpportunity({
    ...input,
    organization_name: organizationName(c.ipp, o.employer_id),
  });
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);
  const at = when(opts);
  const fields: Fields = {
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    work_mode: input.work_mode as WorkMode,
    duration: input.duration.trim(),
  };
  const version = rec.version + 1;
  const ipp: IppData = {
    ...c.ipp,
    opportunities: c.ipp.opportunities.map((x) =>
      x.opportunity_id === id ? { ...x, ...fields } : x,
    ),
  };
  const next = setRecord(
    { ...c, ipp },
    {
      ...rec,
      review_status: "Pending Review",
      version,
      ticks: [],
      history: [...rec.history, snapshotOf(fields, version, at)],
    },
  );
  return addEvent(next, {
    opportunity_id: id,
    type: "Resubmitted",
    actor: organizationName(c.ipp, o.employer_id),
    version,
    at,
  });
}

export { WORK_MODES };

// ---------- Browser store (own key, same pattern as Team 1's) ----------

const EMPTY: P03State = { records: {}, events: [] };
let cache: P03State | null = null;
const listeners = new Set<() => void>();

function load(): P03State {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(P03_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as P03State) : null;
    cache = parsed && parsed.records && Array.isArray(parsed.events) ? parsed : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export function saveP03(state: P03State) {
  cache = state;
  try {
    window.localStorage.setItem(P03_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be blocked; the in-memory copy still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function resetP03() {
  saveP03(EMPTY);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Returns null during SSR / before hydration. */
export function useP03State(): P03State | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

/**
 * Runs one action against the current data and saves both stores. Throws what the action throws,
 * and saves nothing in that case. Team 1's data is written only when the action changed it.
 */
export function commitReview(ipp: IppData, action: (c: Combined) => Combined): void {
  const before = reconcile({ ipp, p03: load() });
  const after = action(before);
  if (after.ipp !== ipp) saveData(after.ipp);
  saveP03(after.p03);
}
