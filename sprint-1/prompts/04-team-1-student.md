# Prompt 04: Team 1 Student bundle

**Build slot:** 4 of 6, after the foundation, Employer HR (Team 2) and University Administrator (Team 3). **Entered by:** Team 1 integrator, after announcing the slot in Teams.
**Status:** staged 3 Nov 2026, not sent. Prompt review by Team 1 before sending.
**Source:** Lab 3 Appendix 2 Student bundle, with field names and IDs from docs/data-dictionary.md and the Team 1 feature brief.

## Before sending

- [ ] Teams 2 and 3 have handed over: a new opportunity can be submitted and approved, and it carries work_mode and duration
- [ ] TC-SH-01 to TC-SH-03 and the Team 2 and 3 tests still pass

## Prompt (copy everything inside the box)

```text
Extend the existing IPP application with these Student stories. Preserve the shared data model, field names, IDs, seed data and all existing functionality. Use the shared Approved opportunities and the seeded student STU-001; do not create a separate dataset.

STU-01 Browse and search opportunities. As a student, I want to browse and search approved internships so that I can find a suitable opportunity.
- Show only opportunities whose approval_status is "Approved".
- Each card shows organization_name (from the linked Employer), title, description, location, work_mode, duration and opportunity_id.
- Search by title or organization, case-insensitive.
- Show a clear message when nothing matches.

STU-02 Submit an application. As a student, I want to apply to an approved opportunity so that I can express interest.
- "View & apply" opens a confirmation dialog naming the opportunity (title, organization, opportunity_id) and the applicant (display_name, student_id).
- Cancel closes the dialog without creating anything.
- Confirm creates a new Application with the next APP-### id, linked to the existing opportunity_id and student_id, application_status "Submitted" and submitted_at set to the current date-time.
- At the same time create a Faculty review record with the next REV-### id, this application_id, faculty_id FAC-001 and review_status "Available for review".
- Block a second application by the same student to the same opportunity; the card then shows "Application submitted".
- State clearly that submitting an application does not approve a placement.

STU-03 Track my applications. As a student, I want to view my applications so that I can follow their status.
- A "My applications" tab lists application_id, opportunity title and organization, and application_status.
- Show placement status in a separate column or badge as "Not placed".
- Update the application count on the summary card and mark opportunities already applied to.

STU-04 Maintain my demo profile. As a student, I want to view my profile and update my display name so that my information is recognizable.
- A "My profile" tab shows student_id (read-only), display_name (editable) and eligibility_status.
- Save only a nonblank, non-whitespace display_name; otherwise show a clear message and keep the old name.
- Explain that eligibility verification is deferred.

Layout: put Opportunities, My applications and My profile in tabs, with three summary cards above them (open opportunities, my applications, profile eligibility). Replace the "Browse and application features come later" subtitle.

Handoff: submitted applications must be available to the Faculty Reviewer view, linked to the same student_id and opportunity_id.

When done, list what changed (screens, fields, logic) and confirm that no field names, IDs or seed records were changed.
```

The layout paragraph was added when the prompt was sent (3 Nov), to match the instructor's reference Student view.

## Tests to run after the build

TC-STU-01 to TC-STU-10, then TC-SH-02 again. Record results in docs/test-cases.md and the prompt entry in docs/prompt-log.md, then hand the slot to the Team 4 integrator.
