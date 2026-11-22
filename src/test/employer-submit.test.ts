import { describe, expect, it } from "vitest";
import { addOpportunity, makeSeed, validateOpportunity } from "@/lib/ipp-store";

const base = { organization_name: "Evergreen Labs", title: "T", description: "D", location: "L", work_mode: "Remote", duration: "8 weeks" };

describe("EMP-01 submit opportunity", () => {
  it("rejects whitespace-only fields", () => {
    const e = validateOpportunity({ ...base, title: "   ", location: "" });
    expect(Object.keys(e).sort()).toEqual(["location", "title"]);
  });
  it("reuses existing employer case-insensitively and creates OP-028 Pending Review", () => {
    const r = addOpportunity(makeSeed(), { ...base, organization_name: "  evergreen LABS " });
    expect(r.opportunity.opportunity_id).toBe("OP-028");
    expect(r.opportunity.employer_id).toBe("EMP-001");
    expect(r.opportunity.approval_status).toBe("Pending Review");
    expect(r.data.employers).toHaveLength(2);
  });
  it("creates new employer EMP-003 / HR-003 authorized", () => {
    const r = addOpportunity(makeSeed(), { ...base, organization_name: "Riverbend Co" });
    expect(r.data.employers[2]).toEqual({ employer_id: "EMP-003", organization_name: "Riverbend Co", hr_user_id: "HR-003", hr_authorized: true });
    expect(r.opportunity.employer_id).toBe("EMP-003");
  });
});
