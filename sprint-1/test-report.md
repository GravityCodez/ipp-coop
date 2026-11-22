# Sprint 1 test report (run 3, 5 Nov 2026)

**Build tested:** IPP - Master at commit 21ffb54: all four role bundles, the group brief's records and the integration build (00, 02, 03, 04, 05, 07, 06). **Where:** Lovable preview in Chrome. **Run by:** the Team 1 integrator. Form input and confirm boxes were driven by script; keyboard checks used real key presses. A hand repeat by the Team 1 QA owner and acceptance by Teams 2, 3 and 4 are still open. Full case list: [docs/test-cases.md](../docs/test-cases.md).

## Result by acceptance area

| Area | Cases | Pass | Fail | Partial or unverified |
| --- | --- | --- | --- | --- |
| Shared shell (IPP-13, 14, 15) | 3 | 3 | 0 | 0 |
| Employer HR (EMP-01..03) | 4 | 4 | 0 | 0 |
| University Administrator (ADM-01..03) | 3 | 3 | 0 | 0 |
| Student (STU-01..04) | 10 | 10 | 0 | 0 |
| Faculty Reviewer (FAC-01..03) | 3 | 3 | 0 | 0 |
| End-to-end and accessibility | 2 | 2 | 0 | 0 |
| **Total** | **25** | **25** | **0** | **0** |

Earlier: run 1 (3 Nov, before the Faculty view existed) 20 pass, 3 fail, 2 partial; run 2 (5 Nov, before build 06) 24 pass, 1 partial.

## The integrated journey

| Step | Record | Result |
| --- | --- | --- |
| 1. Employer HR submits | OP-028 (Emirates Group, EMP-003 / HR-003), Pending Review | Works |
| 2. Hidden from students until approved | OP-028 not in the student list | Works |
| 3. Admin approves the same record | OP-028 → Approved, ID unchanged, shown as Approved to Employer HR | Works |
| 4. Student applies; duplicate blocked | APP-028 (COOP-B001 → OP-028), Submitted; REV-028 Available for review; placement Not placed | Works |
| 5. Faculty Reviewer sees the record | APP-028, COOP-B001, OP-028, REV-028, read-only, Submitted and Not placed shown separately | Works |
| Reload | All records kept | Works |

## What is real, simulated or deferred

| Function | Status |
| --- | --- |
| Opportunity submission, approval, application, duplicate block, profile edit, read-only faculty view, reset | Real in the prototype (browser storage) |
| Role switching | Simulated (sidebar, labelled) |
| HR authorization | Simulated (checkbox, labelled) |
| Eligibility | Seeded value only; verification deferred (IPP-20) |
| Authentication and role permissions | Deferred (IPP-17) |
| Shared storage across users and devices | Deferred (IPP-18). Records exist only in the browser that made them, so a demo must run in one browser |
| Faculty review outcomes and placement decisions | Deferred (IPP-21, IPP-22) |

## Open limitations

1. Not checked on a real phone. Layout was measured at 390 and 1280 px and viewed at 500 px.
2. Tests were scripted. No hand repeat by the QA owner yet; peer usability tests not run.
3. Teams 2, 3 and 4 have not accepted the bundles entered for them (D-15).
4. Sprint 0 requirement numbers are not linked in the traceability table: the consolidated register was not available to Team 1 on 5 Nov.
5. Records live in one browser, so the live demo must run from one browser. Seed descriptions are placeholder text (K-04).
6. Small UI items reported after run 3 are open: K-08 to K-10 in docs/test-cases.md. None changes a test result.
