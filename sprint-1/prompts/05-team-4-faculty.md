# Prompt 05: Team 4 Faculty Reviewer bundle

**Build slot:** 5 of 6. **Source:** Lab 3 Appendix 2 Faculty Reviewer bundle, with decision D-06 and the field names in docs/data-dictionary.md.

## Prompt

```text
Extend the same IPP application with these Faculty Reviewer stories. Read the applications created by the Student bundle; do not create disconnected sample applications. Preserve the shared data model, field names, IDs, seed data and all existing functionality.

FAC-01 View application records. As a faculty reviewer, I want to see student applications so that I can understand each student's current progress.
- Replace the "Review queue" placeholder with an "Applications" list.
- For each application show student display_name, organization, opportunity title, application_id, student_id and opportunity_id.
- Show the linked faculty review record (created when the student applied): review_id and review_status.
- When there are no applications, show an informative empty state.

FAC-02 Distinguish application from placement. As a faculty reviewer, I want separate application and placement statuses so that I do not mistake an application for a confirmed placement.
- Show application_status ("Submitted") and placement status ("Not placed") as two separate labelled values.
- Explain that viewing a record does not approve a placement.

FAC-03 Inspect records without changing them. As a faculty reviewer, I want a read-only view for this increment so that I can inspect the integrated handoff.
- Label the view "Read-only".
- Provide no actions that change application status, review status or placement.
- Linked records stay the same when switching between role views.

Do not add review decisions in this increment. When done, list what changed and confirm no field names, IDs or seed records were changed.
```
