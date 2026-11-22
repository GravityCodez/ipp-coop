# Prompt 03: Team 3 University Administrator bundle

**Build slot:** 3 of 6. **Source:** Lab 3 Appendix 2 University Administrator bundle, with the field names in docs/data-dictionary.md.

## Prompt

```text
Extend the same IPP application with these University Administrator stories. Use the opportunities created by the Employer HR bundle; do not create a separate dataset. Preserve the shared data model, field names, IDs, seed data and all existing functionality.

ADM-01 View the review queue. As a university administrator, I want to see pending opportunities so that I can identify submissions awaiting review.
- Replace the "Approvals" placeholder with a "Review queue" listing opportunities whose approval_status is "Pending Review".
- Show organization, title, description, location, work mode, duration and opportunity_id for each.
- When the queue is empty, show a useful message such as "No opportunities are waiting for review."

ADM-02 Approve an opportunity. As a university administrator, I want to approve an opportunity so that students can apply.
- Each queue item has an "Approve" button.
- Approval updates the existing record's approval_status to "Approved" without changing its opportunity_id, removes it from the queue, and makes it visible in the Student view.
- Show a short confirmation naming the opportunity_id.

ADM-03 View approved opportunities. As a university administrator, I want to see approved opportunities so that I can confirm publication status.
- Show an "Approved opportunities" list separately from the pending queue.
- The same approval status must show in the Employer HR view.

Keep the record counts card. Do not add rejection, revision or placement decisions in this increment. When done, list what changed and confirm no field names, IDs or seed records were changed.
```
