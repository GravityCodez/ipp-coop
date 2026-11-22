# Prompt 06: integrate and demonstrate

**Build slot:** last, all teams. **Source:** Lab 3 Appendix 2 final prompt, plus the issues found in test run 2 (K-03, K-05, K-06, K-07).

## Prompt

```text
Validate the complete IPP walking skeleton using one newly created synthetic record, and fix anything that fails. Preserve the shared data model, field names, IDs and seed data.

Check this sequence end to end:
- Employer HR submits an opportunity; it starts in "Pending Review".
- Students cannot see it yet.
- The University Administrator approves that same opportunity.
- The student finds it and submits an application.
- A duplicate application is prevented.
- The Faculty Reviewer sees the same application and linked IDs.
- Application status is "Submitted"; placement status is "Not placed".
- Reloading the page preserves records in the same browser.

Reset demo must ask for confirmation and restore the initial synthetic dataset exactly.

Verify readable layouts on mobile and desktop, labelled form controls, keyboard navigation with visible focus, and clear validation messages. Fix failed handoffs before expanding scope.

Also fix these known issues:
- After the student's apply dialog closes (Esc, Cancel or Confirm), return keyboard focus to a sensible element: the card's button, or the card's status when the button is gone. It currently drops to the page body.
- At phone width, opening the Roles menu must move keyboard focus into the menu, keep it there while open, close on Esc, and return focus to the Roles button. Hidden role links must not be reachable while the menu is closed.
- Make the keyboard focus ring clearly visible on dark green primary buttons.
- Fix the hydration-mismatch warning on page load if it still occurs.

Report each check above as passed, failed or unverified. State plainly that role switching and HR authorization are simulated, storage is browser-local, and real authentication, shared storage, eligibility verification and placement decisions are deferred.

Change only app code and tests in this turn. Do not edit docs/, sprint-1/ or roadmap.md and do not record test results or tester names there; the team records its own test results.
```
