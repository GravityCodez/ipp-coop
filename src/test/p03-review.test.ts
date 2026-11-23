import { describe, expect, it } from "vitest";
import {
  addOpportunity,
  makeSeed,
  searchApprovedOpportunities,
  submitApplication,
} from "@/lib/ipp-store";
import {
  approve,
  changesRequested,
  checklistHints,
  CHECKLIST,
  closeListing,
  decisionLog,
  latestChangeRequest,
  nextReviewId,
  publish,
  publishedListings,
  readyToPublish,
  reconcile,
  recordFor,
  requestChanges,
  resubmit,
  reviewQueue,
  toggleCheck,
  versionChanges,
  withdrawListing,
  type CheckKey,
  type Combined,
} from "@/lib/p03/review";

const input = {
  organization_name: "Harbor Health",
  title: "Research Assistant Intern",
  description:
    "Synthetic description: clean survey data for a patient study, run weekly summaries in Python and present findings. Supervisor: Dr. Mariam Saeed, Research Lead.",
  location: "Abu Dhabi",
  work_mode: "Hybrid",
  duration: "12 weeks",
};

function start(): { c: Combined; id: string } {
  const r = addOpportunity(makeSeed(), input);
  return { c: { ipp: r.data, p03: { records: {}, events: [] } }, id: r.opportunity.opportunity_id };
}
const tickAll = (c: Combined, id: string) =>
  CHECKLIST.reduce((acc, k) => toggleCheck(acc, id, k.key as CheckKey), c);
const visible = (c: Combined, q = "") =>
  searchApprovedOpportunities(c.ipp, q).map((o) => o.opportunity_id);

describe("P03 review: checklist gate", () => {
  it("approve is refused until all five checks are ticked, then names what is open", () => {
    const { c, id } = start();
    expect(() => approve(c, id)).toThrow(/Tick every check/);
    const four = CHECKLIST.slice(0, 4).reduce((acc, k) => toggleCheck(acc, id, k.key), c);
    expect(() => approve(four, id)).toThrow(/Learning relevance/);
    expect(recordFor(approve(tickAll(c, id), id), id).review_status).toBe("Approved");
  });
  it("a tick can be undone", () => {
    const { c, id } = start();
    const once = toggleCheck(c, id, "timing");
    expect(recordFor(once, id).ticks).toEqual(["timing"]);
    expect(recordFor(toggleCheck(once, id, "timing"), id).ticks).toEqual([]);
  });
  it("hints flag missing supervisor and short descriptions", () => {
    const h = checklistHints({
      title: "T",
      description: "Short. Supervisor to be confirmed.",
      location: "L",
      work_mode: "Remote",
      duration: "",
    });
    expect(h.supervision.ok).toBe(false);
    expect(h.tasks.ok).toBe(false);
    expect(h.timing.ok).toBe(false);
    expect(h.learning.ok).toBeNull();
  });
});

describe("P03 review: request changes and resubmit", () => {
  it("a reason is required and the item leaves the queue", () => {
    const { c, id } = start();
    expect(() => requestChanges(c, id, "   ")).toThrow(/reason/);
    expect(() => requestChanges(c, id, "no")).toThrow(/reason/);
    const next = requestChanges(c, id, "Please name the workplace supervisor.");
    expect(reviewQueue(next).map((i) => i.opportunity.opportunity_id)).not.toContain(id);
    expect(changesRequested(next).map((i) => i.opportunity.opportunity_id)).toEqual([id]);
    expect(latestChangeRequest(next, id)?.reason).toBe("Please name the workplace supervisor.");
    expect(visible(next)).not.toContain(id);
  });
  it("resubmit keeps the ID, becomes v2, returns to Pending Review and clears ticks", () => {
    const { c, id } = start();
    const ticked = tickAll(c, id);
    const sent = requestChanges(ticked, id, "Please give the start date and length.");
    expect(recordFor(sent, id).ticks).toEqual([]);
    const v2 = resubmit(sent, id, { ...input, duration: "12 weeks from 6 Jan 2027" });
    const rec = recordFor(v2, id);
    expect(rec.version).toBe(2);
    expect(rec.review_status).toBe("Pending Review");
    expect(rec.history.map((h) => h.version)).toEqual([1, 2]);
    expect(v2.ipp.opportunities.find((o) => o.opportunity_id === id)?.duration).toBe(
      "12 weeks from 6 Jan 2027",
    );
    expect(reviewQueue(v2).map((i) => i.opportunity.opportunity_id)).toContain(id);
    expect(versionChanges(rec, 1, 2)).toEqual([
      { field: "Duration", before: "12 weeks", after: "12 weeks from 6 Jan 2027" },
    ]);
  });
  it("only items with changes requested can be resubmitted, and blank fields are refused", () => {
    const { c, id } = start();
    expect(() => resubmit(c, id, input)).toThrow(/changes requested/);
    const sent = requestChanges(c, id, "Please add more detail.");
    expect(() => resubmit(sent, id, { ...input, title: "  " })).toThrow(/Title is required/);
  });
});

describe("P03 review: publish, close, withdraw", () => {
  it("approving does not publish; publishing makes it visible through Team 1's student search", () => {
    const { c, id } = start();
    const approved = approve(tickAll(c, id), id);
    expect(visible(approved)).not.toContain(id);
    expect(readyToPublish(approved).map((i) => i.opportunity.opportunity_id)).toEqual([id]);
    const live = publish(approved, id);
    expect(visible(live, "harbor")).toEqual([id]);
    expect(live.ipp.opportunities.find((o) => o.opportunity_id === id)?.approval_status).toBe(
      "Approved",
    );
    expect(publishedListings(live).map((i) => i.opportunity.opportunity_id)).toContain(id);
  });
  it("cannot publish an unapproved item or publish twice", () => {
    const { c, id } = start();
    expect(() => publish(c, id)).toThrow(/Only approved/);
    const live = publish(approve(tickAll(c, id), id), id);
    expect(() => publish(live, id)).toThrow(/already published/);
  });
  it("close needs a reason, removes it from students and blocks new applications", () => {
    const { c, id } = start();
    const live = publish(approve(tickAll(c, id), id), id);
    expect(() => closeListing(live, id, "")).toThrow(/reason/);
    const closed = closeListing(live, id, "Position filled.");
    expect(visible(closed)).not.toContain(id);
    expect(recordFor(closed, id).listing_status).toBe("Closed");
    expect(() => submitApplication(closed.ipp, id, "COOP-B001")).toThrow(/approved/i);
    expect(() => publish(closed, id)).toThrow(/closed/);
  });
  it("only published listings can be closed", () => {
    const { c, id } = start();
    expect(() => closeListing(c, id, "Not needed anymore")).toThrow(/Only published/);
  });
  it("employer withdrawal removes a waiting item from the queue and a live one from students", () => {
    const { c, id } = start();
    const gone = withdrawListing(c, id, "We hired internally.");
    expect(reviewQueue(gone).map((i) => i.opportunity.opportunity_id)).not.toContain(id);
    const live = publish(approve(tickAll(c, id), id), id);
    expect(visible(withdrawListing(live, id, "Role cancelled."))).not.toContain(id);
  });
  it("seeded approved Team 1 listings count as published v1 and stay visible; closing one hides it", () => {
    const c: Combined = { ipp: makeSeed(), p03: { records: {}, events: [] } };
    expect(recordFor(c, "OP-026")).toMatchObject({
      review_status: "Approved",
      listing_status: "Published",
      version: 1,
    });
    const closed = closeListing(c, "OP-026", "Employer asked us to stop.");
    expect(visible(closed)).toEqual(["OP-027"]);
  });
});

describe("P03 review: IDs and log", () => {
  it("review IDs use the shared database format REV-0001 and ignore Team 1's REV-028 style", () => {
    expect(nextReviewId([])).toBe("REV-0001");
    expect(nextReviewId(["REV-0001", "REV-0007", "REV-028", ""])).toBe("REV-0008");
  });
  it("each decision gets its own review ID, in order", () => {
    const { c, id } = start();
    const sent = requestChanges(c, id, "Please add the supervisor.");
    const v2 = resubmit(sent, id, input);
    const done = approve(tickAll(v2, id), id);
    const ids = decisionLog(done)
      .filter((e) => e.review_id)
      .map((e) => e.review_id);
    expect(ids).toEqual(["REV-0002", "REV-0001"]);
  });
  it("the log keeps reviewer, version, reason and time, newest first", () => {
    const { c, id } = start();
    const next = publish(approve(tickAll(c, id), id), id, {
      now: new Date("2026-11-23T10:00:00Z"),
    });
    const log = decisionLog(next);
    expect(log.map((e) => e.type)).toEqual(["Published", "Approved"]);
    expect(log[0]).toMatchObject({
      actor: "Sara Ahmed (Careers coordinator)",
      version: 1,
      at: "2026-11-23T10:00:00.000Z",
    });
  });
  it("records left over from a reset of Team 1's data are dropped, not applied to a reused ID", () => {
    const { c, id } = start();
    const live = publish(approve(tickAll(c, id), id), id);
    const reset: Combined = {
      ipp: addOpportunity(makeSeed(), { ...input, title: "Different role" }).data,
      p03: live.p03,
    };
    const clean = reconcile(reset);
    expect(clean.p03.events).toEqual([]);
    expect(recordFor(clean, id).review_status).toBe("Pending Review");
  });
});
