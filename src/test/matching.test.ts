import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILES, type MatchProfile } from "@/lib/ai/knowledge";
import {
  buildListings,
  inferRequirements,
  missingProfileInfo,
  normalizeProfileSkills,
  normalizeSkill,
  recommend,
} from "@/lib/ai/matching";
import { addOpportunity, approveOpportunity, makeSeed } from "@/lib/ipp-store";

const profile = (id: string): MatchProfile => SAMPLE_PROFILES.find((p) => p.student_id === id)!;

function seedWithOp028() {
  const { data, opportunity } = addOpportunity(makeSeed(), {
    organization_name: "Emirates Group",
    title: "Aviation Analytics Intern",
    description: "Synthetic description: analyse flight operations data and build dashboards.",
    location: "Dubai",
    work_mode: "On-site",
    duration: "12 weeks",
  });
  expect(opportunity.opportunity_id).toBe("OP-028");
  return approveOpportunity(data, "OP-028");
}

describe("Sprint 2 data preparation", () => {
  it("maps equivalent skill terms to one ID", () => {
    expect(normalizeSkill("Python programming")).toBe("SK-PY-01");
    expect(normalizeSkill("python")).toBe("SK-PY-01");
    expect(normalizeSkill("Jira software")).toBe("SK-JIRA-01");
    expect(normalizeSkill("Power BI")).toBe("SK-VIZ-01");
    expect(normalizeSkill("Social media")).toBeNull();
  });
  it("keeps unmapped skills and records missing profile information", () => {
    expect(normalizeProfileSkills(profile("COOP-S203")).unmapped).toEqual(["Social media"]);
    expect(missingProfileInfo(profile("COOP-S202"))).toEqual([
      "availability",
      "preferred work mode",
      "preferred location",
    ]);
  });
  it("infers requirements from listing text when the employer gave none", () => {
    expect(
      inferRequirements("QA Automation Intern", "Write unit testing scripts in JavaScript")
        .required,
    ).toEqual(["SK-JS-01", "SK-TEST-01"]);
  });
});

describe("Sprint 2 matching engine", () => {
  it("only ranks approved IPP listings plus the sample listings", () => {
    const { data } = addOpportunity(makeSeed(), {
      organization_name: "Evergreen Labs",
      title: "Pending Intern",
      description: "Synthetic.",
      location: "Boston, MA",
      work_mode: "Remote",
      duration: "8 weeks",
    });
    const ids = buildListings(data).map((l) => l.opportunity_id);
    expect(ids).not.toContain("OP-028");
    expect(ids.slice(0, 2)).toEqual(["OP-026", "OP-027"]);
  });
  it("returns exactly three ranked listings with reasons for each of three profiles", () => {
    for (const id of ["COOP-B001", "COOP-S201", "COOP-S202"]) {
      const recs = recommend(profile(id), buildListings(seedWithOp028()));
      expect(recs.map((r) => r.rank)).toEqual([1, 2, 3]);
      recs.forEach((r) => expect(r.reasons.length).toBeGreaterThan(0));
      expect(recs[0]!.score).toBeGreaterThanOrEqual(recs[2]!.score);
    }
  });
  it("puts OP-028 first for Layla and shows Jira as self-declared, not reviewed", () => {
    const [top] = recommend(profile("COOP-B001"), buildListings(seedWithOp028()));
    expect(top!.listing.opportunity_id).toBe("OP-028");
    expect(top!.reasons.join(" ")).toContain(
      "Jira (self-declared, evidence E-JIRA-01 not yet reviewed)",
    );
    expect(top!.gaps.join(" ")).toContain("until evidence E-JIRA-01 is reviewed");
  });
  it("ranks a design listing first for Noah and a software listing first for Mei", () => {
    expect(
      recommend(profile("COOP-S201"), buildListings(makeSeed()))[0]!.listing.requirements.field,
    ).toBe("Design / UX");
    expect(
      recommend(profile("COOP-S202"), buildListings(makeSeed()))[0]!.listing.opportunity_id,
    ).toBe("OP-S02");
  });
  it("a reviewed Jira skill raises the score (repeatable change test)", () => {
    const before = recommend(profile("COOP-B001"), buildListings(seedWithOp028()))[0]!;
    const reviewed: MatchProfile = {
      ...profile("COOP-B001"),
      skills: profile("COOP-B001").skills.map((s) =>
        s.raw === "Jira" ? { ...s, status: "Reviewed" as const } : s,
      ),
    };
    const after = recommend(reviewed, buildListings(seedWithOp028()))[0]!;
    expect(after.listing.opportunity_id).toBe("OP-028");
    expect(after.score).toBeGreaterThan(before.score);
  });
  it("ignores eligibility when ranking and reports it separately", () => {
    const eligible = profile("COOP-S203");
    const other: MatchProfile = { ...eligible, eligibility_status: "Eligible" };
    const a = recommend(eligible, buildListings(makeSeed()));
    const b = recommend(other, buildListings(makeSeed()));
    expect(a.map((r) => [r.listing.opportunity_id, r.score])).toEqual(
      b.map((r) => [r.listing.opportunity_id, r.score]),
    );
    expect(a[0]!.eligibility).toBe("Not recorded");
  });
  it("ignores the student's name and ID when ranking", () => {
    const renamed: MatchProfile = {
      ...profile("COOP-B001"),
      display_name: "Someone Else",
      student_id: "COOP-X999",
    };
    expect(recommend(renamed, buildListings(makeSeed())).map((r) => r.score)).toEqual(
      recommend(profile("COOP-B001"), buildListings(makeSeed())).map((r) => r.score),
    );
  });
});
