import { afterEach, describe, expect, it, vi } from "vitest";
import {
  makeSeed,
  PLACEMENT_STATUS,
  searchApprovedOpportunities,
  submitApplication,
  updateStudentDisplayName,
} from "@/lib/ipp-store";

afterEach(() => vi.useRealTimers());

/** Safe indexed read for tests: fails loudly instead of returning undefined. */
function at<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an item at index ${index}.`);
  return item;
}

describe("Student opportunity browsing", () => {
  it("shows only Approved opportunities", () => {
    const data = makeSeed();
    at(data.opportunities, 0).approval_status = "Pending Review";
    expect(searchApprovedOpportunities(data, "").map((o) => o.opportunity_id)).toEqual(["OP-027"]);
  });
  it("searches title case-insensitively", () => {
    expect(
      searchApprovedOpportunities(makeSeed(), "PRODUCT design").map((o) => o.opportunity_id),
    ).toEqual(["OP-026"]);
  });
  it("searches linked organization case-insensitively", () => {
    expect(
      searchApprovedOpportunities(makeSeed(), "NORTHSTAR").map((o) => o.opportunity_id),
    ).toEqual(["OP-027"]);
  });
  it("returns no results for an unmatched search", () => {
    expect(searchApprovedOpportunities(makeSeed(), "unmatched")).toEqual([]);
  });
});

describe("Student applications", () => {
  it("creates a Submitted APP-028 linked to COOP-B001 and OP-026 at the current date-time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T05:53:00Z"));
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    expect(data.applications).toEqual([
      {
        application_id: "APP-028",
        opportunity_id: "OP-026",
        student_id: "COOP-B001",
        application_status: "Submitted",
        submitted_at: "2026-11-03T05:53:00.000Z",
      },
    ]);
  });
  it("simultaneously creates REV-028 for APP-028 and FAC-001, Available for review", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    expect(data.faculty_reviews).toEqual([
      {
        review_id: "REV-028",
        application_id: "APP-028",
        faculty_id: "FAC-001",
        review_status: "Available for review",
      },
    ]);
  });
  it("uses the next unused APP and REV IDs independently", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    at(data.applications, 0).application_id = "APP-030";
    at(data.faculty_reviews, 0).application_id = "APP-030";
    at(data.faculty_reviews, 0).review_id = "REV-035";
    const next = submitApplication(data, "OP-027", "COOP-B001");
    expect(at(next.applications, 1).application_id).toBe("APP-031");
    expect(at(next.faculty_reviews, 1).review_id).toBe("REV-036");
    expect(at(next.faculty_reviews, 1).application_id).toBe("APP-031");
  });
  it("blocks duplicates without adding an application or faculty review", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    const before = structuredClone(data);
    expect(() => submitApplication(data, "OP-026", "COOP-B001")).toThrow("cannot apply");
    expect(data).toEqual(before);
  });
  it("blocks applications to Pending Review opportunities", () => {
    const data = makeSeed();
    at(data.opportunities, 0).approval_status = "Pending Review";
    expect(() => submitApplication(data, "OP-026", "COOP-B001")).toThrow("Only approved");
    expect(data.applications).toEqual([]);
    expect(data.faculty_reviews).toEqual([]);
  });
  it("never stores placement status or changes seed records", () => {
    const seed = makeSeed();
    const data = submitApplication(seed, "OP-026", "COOP-B001");
    expect(PLACEMENT_STATUS).toBe("Not placed");
    expect(Object.keys(at(data.applications, 0)).sort()).toEqual([
      "application_id",
      "application_status",
      "opportunity_id",
      "student_id",
      "submitted_at",
    ]);
    expect({ ...data, applications: [], faculty_reviews: [] }).toEqual(makeSeed());
    expect(seed).toEqual(makeSeed());
  });
});

describe("Student demo profile", () => {
  it.each(["", "   ", "\t\n"])(
    "rejects a blank display name %j and preserves the old name",
    (name) => {
      const seed = makeSeed();
      expect(() => updateStudentDisplayName(seed, "COOP-B001", name)).toThrow("nonblank");
      expect(at(seed.students, 0).display_name).toBe("Layla Hassan");
    },
  );
  it("changes only display_name while preserving student_id and eligibility", () => {
    const seed = makeSeed();
    const updated = updateStudentDisplayName(seed, "COOP-B001", "  Layla H.  ");
    expect(updated.students).toEqual([
      { student_id: "COOP-B001", display_name: "Layla H.", eligibility_status: "Eligible" },
    ]);
    expect({ ...updated, students: seed.students }).toEqual(seed);
    expect(seed).toEqual(makeSeed());
  });
});
