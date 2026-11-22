# Prompt 00: shared application foundation

**Build slot:** 1 of 6. **Entered by:** nominated lead integrator, once, in the IPP – Master Lovable project.
**Status:** sent 3 Nov 2026, 09:32 Asia/Dubai, by the project owner before the Scrum of Scrums had agreed the data dictionary. Any change agreed later goes in as a follow-up prompt. Result: docs/prompt-log.md row 00.
**Source:** Lab 3 Appendix 2 foundation prompt and Appendix 3 look and feel, with the agreed field names, IDs and seeds from docs/data-dictionary.md.

## Prompt (copy everything inside the box)

```text
Create a university Internship Practicum Platform (IPP) demonstration with four persona views: Employer HR, University Administrator, Student, and Faculty Reviewer.

Build ONE integrated application with shared records and consistent navigation. Do not build anything else yet.

Look and feel: a white left sidebar with "IPP – Internship Practicum" branding and the four role navigation items; light neutral background; dark green headings and buttons; rounded cards; muted green status indicators. A persistent banner at the top says: "Demo workspace · Role switching is simulated. Synthetic data is saved only in this browser." with a "Reset demo" link. Responsive: two-column cards on desktop, one column on mobile. Start in the Student view.

Use synthetic data only. Label role switching and HR authorization as simulations. Store all records in browser local storage under one key so they persist through role changes and page reloads, and say on screen that records are not shared across devices.

Use exactly these records and field names:
- Employer: employer_id, organization_name, hr_user_id, hr_authorized
- Opportunity: opportunity_id, employer_id, title, description, location, work_mode, duration, approval_status
- Student: student_id, display_name, eligibility_status
- Application: application_id, opportunity_id, student_id, application_status, submitted_at
- Faculty review: review_id, application_id, faculty_id, review_status

IDs are three-digit and zero-padded: EMP-001, HR-001, OPP-001, STU-001, APP-001, REV-001, FAC-001. New IDs take the next unused number.
Status values: approval_status is "Pending Review" or "Approved". application_status is "Submitted". review_status is "Available for review". work_mode is "On-site", "Hybrid" or "Remote". eligibility_status is "Eligible". Placement status is not stored: always display it separately as "Not placed". Do not implement placement approval.

Seed exactly:
- EMP-001 Evergreen Labs (HR-001, hr_authorized true); EMP-002 Northstar Analytics (HR-002, hr_authorized true)
- OPP-001 "Product Design Intern", EMP-001, Boston, MA, Hybrid, 12 weeks, Approved
- OPP-002 "Data Analytics Intern", EMP-002, Cambridge, MA, On-site, 10 weeks, Approved
- STU-001 Alex Lee, Eligible
- FAC-001 synthetic faculty reviewer
- No applications or reviews

In this step create only the shell, the data model with seed data, the four role views as placeholders, the banner, and a Reset demo action that asks for confirmation and restores exactly the seed data. Four team bundles will add functionality later; preserve these records, field names and IDs in every later change.

When done, list every field, screen and assumption you created so we can review them before adding features. Do not claim production authentication or compliance.
```

## Checks after the build (integrator)

- [ ] Four role views reachable; banner and simulation labels visible (TC-SH-01)
- [ ] Seed data matches docs/data-dictionary.md exactly, including field names
- [ ] Reload keeps data (TC-SH-02); Reset asks for confirmation and restores seeds (TC-SH-03)
- [ ] Change synced to the central GitHub repository (commit visible)
- [ ] Prompt, result summary, test results and known issues recorded in docs/prompt-log.md
- [ ] Build slot handed to the Team 2 integrator in Teams
