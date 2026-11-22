import { describe, expect, it } from "vitest";
import { addOpportunity, approveOpportunity, makeSeed, nextId, type OpportunityInput } from "@/lib/ipp-store";

const INPUT: OpportunityInput = {
  organization_name: "Evergreen Labs",
  title: "QA Automation Intern",
  description: "Synthetic description: write automated tests for internal tooling.",
  location: "Boston, MA",
  work_mode: "Remote",
  duration: "8 weeks",
};

describe("IPP data model", () => {
  it("next ID takes the next unused zero-padded number", () => {
    expect(nextId("OP", ["OP-026", "OP-027"])).toBe("OP-028");
    expect(nextId("APP", [], 28)).toBe("APP-028");
    expect(nextId("APP", ["APP-028"], 28)).toBe("APP-029");
  });
  it("seed has exactly the specified records", () => {
    const s = makeSeed();
    expect(s.employers.map((e) => e.employer_id)).toEqual(["EMP-001", "EMP-002"]);
    expect(s.opportunities.map((o) => o.opportunity_id)).toEqual(["OP-026", "OP-027"]);
    expect(s.students).toEqual([{ student_id: "COOP-B001", display_name: "Layla Hassan", eligibility_status: "Eligible" }]);
    expect(s.applications).toEqual([]);
    expect(s.faculty_reviews).toEqual([]);
  });
});

describe("University Administrator approval", () => {
  it("approval sets approval_status to Approved and keeps every other field unchanged", () => {
    const seed = makeSeed();
    const { data, opportunity } = addOpportunity(seed, INPUT);
    expect(opportunity.approval_status).toBe("Pending Review");
    const updated = approveOpportunity(data, opportunity.opportunity_id).opportunities.find(
      (o) => o.opportunity_id === opportunity.opportunity_id,
    )!;
    expect(updated.approval_status).toBe("Approved");
    expect(updated.opportunity_id).toBe(opportunity.opportunity_id);
    expect(updated).toEqual({ ...opportunity, approval_status: "Approved" });
  });
  it("approval changes no other opportunity and removes the item from the pending queue", () => {
    const seed = makeSeed();
    const first = addOpportunity(seed, INPUT);
    const second = addOpportunity(first.data, { ...INPUT, title: "Support Engineering Intern" });
    expect(second.data.opportunities.filter((o) => o.approval_status === "Pending Review").map((o) => o.opportunity_id))
      .toEqual(["OP-028", "OP-029"]);
    const result = approveOpportunity(second.data, "OP-028");
    expect(result.opportunities.filter((o) => o.approval_status === "Pending Review").map((o) => o.opportunity_id))
      .toEqual(["OP-029"]);
    const untouched = result.opportunities.filter((o) => o.opportunity_id !== "OP-028");
    expect(untouched).toEqual(second.data.opportunities.filter((o) => o.opportunity_id !== "OP-028"));
  });
});
