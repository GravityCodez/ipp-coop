# Prompt 07: switch to the group brief's records

**Build slot:** after 05 (Faculty), before 06 (integration). **Source:** decision D-05 (instructor, 3 Nov 2026) and docs/data-dictionary.md.
**Status:** staged 3 Nov 2026, not sent (no Lovable credits).

## Prompt

```text
Update the shared seed data and ID formats to match the course brief's synthetic thread. Keep every field name, status value, screen and feature exactly as it is.

- Student: replace STU-001 Alex Lee with student_id "COOP-B001", display_name "Layla Hassan", eligibility_status "Eligible". Student IDs use the format COOP-B###.
- Opportunities: rename the prefix OPP- to OP-. Seed OP-026 "Product Design Intern" (EMP-001) and OP-027 "Data Analytics Intern" (EMP-002) with their current details, both Approved. The next new opportunity must be OP-028.
- Applications and faculty reviews: numbering starts at 028, so the first application is APP-028 and its review is REV-028; after that take the next unused number.
- Employers (EMP-###), HR users (HR-###) and FAC-001 stay as they are.
- Use a new local storage key "ipp-master-demo-v2" so browsers holding old data start from the new seeds.
- Update all on-screen text, tests and examples that mention Alex Lee, STU-001 or OPP- IDs.

Reset demo must restore exactly the new seeds. When done, list every changed ID and confirm no field names or status values changed.
```

## Checks after the build

TC-SH-03 (reset restores COOP-B001, OP-026, OP-027), TC-STU-01, then TC-E2E-01 with the brief's demo record: OP-028 → APP-028 → REV-028.
