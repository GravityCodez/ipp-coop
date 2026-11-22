# IPP requirements and Sprint 1 shortlist

**Status: Sprint 1 goal unchanged by the instructor on 3 Nov 2026 (D-03).** The instructor (Product Manager and lead PO) approves the Sprint 1 goal and orders the backlog.

## Product goal

Connect employer opportunity submission, university approval, student application and faculty visibility in one integrated internship platform.

## Sprint 1 goal

Demonstrate the complete four-role journey (Employer HR → University Administrator → Student → Faculty Reviewer) in one shared app, using the same synthetic opportunity and application records. Simulated controls are disclosed, and opportunity approval, application status and placement status stay separate.

## End-to-end journey

1. An authorized Employer HR user submits a sample internship opportunity. It starts as Pending Review. (Team 2)
2. A University Administrator reviews and approves that opportunity. (Team 3)
3. A Student sees the approved opportunity and submits an application. (Team 1)
4. A Faculty Reviewer views the application record and its status, read-only. (Team 4)

## Four actor roles

Student, Employer HR, University Administrator, Faculty Reviewer.

## Sprint 1 shortlist

One thin story per team carries the end-to-end path. The rest of each bundle follows in build order if time allows.

| Order | Story | Backlog ID | Team | Thin path? | Acceptance (summary) | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | App shell, four labelled demo roles, browser-local records, shared data model | IPP-13, IPP-14 | Integrators, all validate | yes | Four views reachable; simulation disclosed; records survive role change and reload | Must |
| 1 | EMP-01 Submit an opportunity | IPP-01 | Team 2 | yes | Required fields enforced; unique OPP ID; starts Pending Review | Must |
| 1 | EMP-02 Simulate HR authorization | IPP-02 | Team 2 | | Unchecked control disables submission; label says not real access control | Must |
| 1 | EMP-03 Track submission status | IPP-03 | Team 2 | | IDs and approval statuses shown from the shared record | Must |
| 2 | ADM-01 View the review queue | IPP-04 | Team 3 | | Lists Pending Review only; empty-state message | Must |
| 2 | ADM-02 Approve an opportunity | IPP-05 | Team 3 | yes | Same record → Approved, leaves queue, visible to students, ID unchanged | Must |
| 2 | ADM-03 View approved opportunities | IPP-03/05 | Team 3 | | Approved shown apart from pending; same status in Employer view | Must |
| 3 | STU-01 Browse and search opportunities | IPP-06 | Team 1 | | Approved only; search by title or organization; no-results message | Must |
| 3 | STU-02 Submit an application | IPP-07, IPP-08 | Team 1 | yes | Confirm dialog; cancel creates nothing; APP linked to OPP and student; Submitted + submitted_at; duplicate blocked; "not a placement" note | Must |
| 3 | STU-03 Track my applications | IPP-09 | Team 1 | | APP ID, opportunity, application status; placement shown separately as Not placed | Must |
| 3 | STU-04 Maintain my demo profile | IPP-10 | Team 1 | | Nonblank display name saves; ID and seeded eligibility shown; verification deferred | Should |
| 4 | FAC-01 View application records | IPP-11 | Team 4 | yes | Names, IDs, linked review_id and review_status; empty state | Must |
| 4 | FAC-02 Distinguish application from placement | IPP-12 | Team 4 | | Submitted vs Not placed shown separately with explanation | Must |
| 4 | FAC-03 Read-only inspection | IPP-11 | Team 4 | | Labelled read-only; no status or placement actions | Must |
| 5 | Integrated acceptance demo and reset | IPP-16, IPP-15 | All teams | yes | One new record passes all four roles with consistent IDs; reset needs confirmation and restores seeds | Must / Should |

Not in Sprint 1: IPP-17 to IPP-22 (authentication, central storage, return for revision, eligibility rules, faculty review outcomes, placement decisions).

## Requirements traceability

Each team links its stories to the class's **Sprint 0 requirement numbers**. Lab 3 calls them R-numbers (R1, R2, R3, ...); the Lab 2 Sprint 0 brief numbers the register FR-01, NFR-01 and BR-01. Do not invent numbers: leave the cell as "to link" until the consolidated Sprint 0 register is open. On 5 Nov it was not in the LMS course page, the class repository or Team 1's chat, so it still has to be obtained from the Scrum of Scrums or the instructor. Results below are from test run 3 (5 Nov).

| R-number (Sprint 0) | User story | Screen or function | Test case | Result |
| --- | --- | --- | --- | --- |
| R3 (lab example: only authorized HR can upload job descriptions) | IPP-01, IPP-02 / EMP-01, EMP-02 | Employer HR: Submit opportunity | TC-EMP-01..04 | Pass |
| to link (Team 1) | IPP-06 / STU-01 | Student: Opportunities | TC-STU-01..03 | Pass |
| to link (Team 1) | IPP-07, IPP-08 / STU-02 | Student: Apply dialog | TC-STU-04..07 | Pass |
| to link (Team 1) | IPP-09 / STU-03 | Student: My applications | TC-STU-08 | Pass |
| to link (Team 1) | IPP-10 / STU-04 | Student: My profile | TC-STU-09..10 | Pass |
| to link (Team 3) | IPP-04, IPP-05 / ADM-01..03 | Admin: Review queue, Approved | TC-ADM-01..03 | Pass |
| to link (Team 4) | IPP-11, IPP-12 / FAC-01..03 | Faculty: Applications | TC-FAC-01..03 | Pass |
| to link (all) | IPP-13..16 | Shell, persistence, reset, end-to-end | TC-E2E-01..02, TC-SH-01..03 | Pass |
