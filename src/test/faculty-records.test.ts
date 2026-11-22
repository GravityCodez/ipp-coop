import { describe, expect, it } from "vitest";
import {
  facultyApplicationRecords,
  makeSeed,
  PLACEMENT_STATUS,
  submitApplication,
  type FacultyApplicationRecord,
} from "@/lib/ipp-store";

/** Safe first-item read for tests: fails loudly instead of returning undefined. */
function only(records: FacultyApplicationRecord[]): FacultyApplicationRecord {
  const record = records[0];
  if (record === undefined) throw new Error("Expected exactly one faculty application record.");
  return record;
}

describe("Faculty application records", () => {
  it("lists nothing until a student has applied", () => {
    expect(facultyApplicationRecords(makeSeed())).toEqual([]);
  });

  it("joins the student's application to its student, organization, opportunity and review", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    const record = only(facultyApplicationRecords(data));
    expect(record.application.application_id).toBe("APP-028");
    expect(record.application.student_id).toBe("COOP-B001");
    expect(record.application.opportunity_id).toBe("OP-026");
    expect(record.application.application_status).toBe("Submitted");
    expect(record.student?.display_name).toBe("Layla Hassan");
    expect(record.opportunity?.title).toBe("Product Design Intern");
    expect(record.organization_name).toBe("Evergreen Labs");
    expect(record.review).toEqual({
      review_id: "REV-028",
      application_id: "APP-028",
      faculty_id: "FAC-001",
      review_status: "Available for review",
    });
  });

  it("keeps the same application, student and opportunity IDs the student view saved", () => {
    const data = submitApplication(makeSeed(), "OP-027", "COOP-B001");
    const record = only(facultyApplicationRecords(data));
    expect(record.application).toEqual(
      data.applications.find((a) => a.application_id === "APP-028"),
    );
    expect(record.opportunity?.opportunity_id).toBe("OP-027");
    expect(record.student?.student_id).toBe("COOP-B001");
  });

  it("shows application status separately from the fixed placement status, which is never stored", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    const record = only(facultyApplicationRecords(data));
    expect(record.application.application_status).toBe("Submitted");
    expect(PLACEMENT_STATUS).toBe("Not placed");
    expect("placement_status" in record.application).toBe(false);
  });

  it("gives each application its own linked review record", () => {
    let data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    data = submitApplication(data, "OP-027", "COOP-B001");
    expect(
      facultyApplicationRecords(data).map((r) => [
        r.application.application_id,
        r.review?.review_id,
        r.review?.review_status,
      ]),
    ).toEqual([
      ["APP-028", "REV-028", "Available for review"],
      ["APP-029", "REV-029", "Available for review"],
    ]);
  });

  it("reads records without changing any stored field", () => {
    const data = submitApplication(makeSeed(), "OP-026", "COOP-B001");
    const before = structuredClone(data);
    facultyApplicationRecords(data);
    facultyApplicationRecords(data);
    expect(data).toEqual(before);
    expect(makeSeed()).toEqual({ ...makeSeed(), applications: [], faculty_reviews: [] });
  });
});
