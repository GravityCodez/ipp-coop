# Prompt 02: Team 2 Employer HR bundle

**Build slot:** 2 of 6. **Source:** Lab 3 Appendix 2 Employer HR bundle, plus decision D-07 (work mode, duration, own employer ID) and the field names in docs/data-dictionary.md.

## Prompt

```text
Extend the existing IPP application with these Employer HR stories. Preserve the shared data model, field names, IDs, seed data and all existing functionality.

EMP-01 Submit an opportunity. As an authorized employer HR representative, I want to submit an internship opportunity so that the university staff can review it.
- Replace the "Post an opportunity" placeholder with a labelled form: organization name, title, description, location, work mode (On-site, Hybrid, Remote) and duration.
- Require organization name, title, description, location, work mode and duration. Reject blank or whitespace-only values with a clear message next to the field.
- If the organization name matches an existing employer (case-insensitive, trimmed), use that employer_id. Otherwise create a new Employer with the next EMP-### id, the next HR-### hr_user_id and hr_authorized true.
- Create the Opportunity with the next OPP-### id, linked by employer_id, approval_status "Pending Review".
- Show a confirmation naming the new opportunity_id and saying it now waits for university review.

EMP-02 Simulate HR authorization. As the product owner, I want unauthorized HR submission blocked in the demonstration so that the authorization rule is visible.
- Add a checkbox labelled "Simulate an authorized HR representative", checked by default.
- When unchecked, disable the submit button and say why.
- State clearly that this is a demo simulation, not production access control.

EMP-03 Track submission status. As an employer HR representative, I want to see submitted opportunities and their approval statuses so that I know what happens next.
- List all opportunities with organization, title, opportunity_id and approval_status, read from the shared records so a later admin approval shows here.
- Explain that "Pending Review" opportunities await university approval and that "Approved" ones are visible to students.

Handoff: Pending Review opportunities must be available to the University Administrator view. Do not change any other view in this step. When done, list what changed and confirm no field names, IDs or seed records were changed.
```
