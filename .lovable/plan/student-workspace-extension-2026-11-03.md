# Student workspace extension

## What changes
- Replace the Student placeholders with Opportunities, My applications, and My profile tabs under three summary cards.
- Browse only shared Approved opportunities; search titles and linked employer names without case sensitivity.
- Confirm applications for STU-001 in a dialog. Cancel creates nothing; confirmation creates linked Submitted Application and Available for review Faculty review records for FAC-001, with next unused IDs and the current timestamp. Prevent duplicates.
- Track applications and show the separate, fixed Not placed status. Clearly state that applying does not approve a placement.
- Allow a nonblank display name update; preserve the old name on invalid input and state that eligibility verification is deferred.

## Shared records and handoff
Keep every existing field, ID format, seed record and Employer/Admin feature intact. Faculty reviews use the existing shared collection; the Faculty placeholder will reflect its updated count without adding faculty decision features.

## Technical details
- Add pure, tested search, submission and profile-update helpers to the existing shared store; save the application and faculty review together.
- Reuse existing tabs, dialog, input and button controls and the established colors.
- Test approval filtering, searches, record links/statuses/timestamps/IDs, duplicate prevention, profile validation, and seed preservation.
- Check the browser flow from cancellation through submission, tracking, profile saving, persistence, and Faculty handoff on desktop and phone widths.