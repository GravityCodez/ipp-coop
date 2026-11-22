# Team 1 feature brief: Student bundle (Sprint 1)

**Team:** S1-Team 1, Student experience (profile, view openings, apply)
**Status:** built (prompt 04) and passing in test run 2 (5 Nov 2026). Roles from the Scrum Master's split, 3 Nov. Estimates still to agree.
**Build slot:** 4th, after the shared foundation, Employer HR (Team 2) and University Administrator (Team 3).

| Role | Name |
| --- | --- |
| PO liaison | Team 1 Product Owner liaison |
| Scrum Master | Team 1 Scrum Master |
| Integrator (submits the Team 1 prompt) | Team 1 integrator; backup Team 1 data dictionary owner |
| Scrum of Scrums representative | Team 1 Scrum Master |
| QA owner | Team 1 QA owner |
| UI owner | Team 1 UI owner |
| Data dictionary owner | Team 1 data dictionary owner |

Members: six students, one per role above.

## Work package (section 7 of the lab)

### STU-01: Browse and search opportunities (IPP-06, Must)

| Item | Entry |
| --- | --- |
| Story link | IPP-06. Sprint 0 R-number: **to link** from the class backlog |
| Story | As a student, I want to browse and search approved internships so that I can find a suitable opportunity. |
| Acceptance | 1) Only opportunities with approval_status Approved appear. 2) Each card shows organization, title, description, location, work_mode and duration. 3) Search matches title or organization, case-insensitive. 4) No match shows a clear message. |
| Screen | Student → Opportunities tab. Access: Student role (simulated). Fields: search box, opportunity cards. Actions: search, "View & apply". |
| Data / handoff | Reads Opportunity (Approved) and Employer. Creates nothing. Depends on Team 3 approving records. |
| Test | TC-STU-01 (seeds only), TC-STU-02 (search hits and no-results), TC-STU-03 (Pending Review OP-028 hidden) |
| Dependency | Team 2 must capture work_mode and duration on new submissions (the reference form does not). Owner: Team 2 integrator. Needed before the Team 1 build slot. |

### STU-02: Submit an application (IPP-07, IPP-08, Must). Thin-path story

| Item | Entry |
| --- | --- |
| Story link | IPP-07, IPP-08. Sprint 0 R-number: **to link** |
| Story | As a student, I want to apply to an approved opportunity so that I can express interest. |
| Acceptance | 1) Confirmation dialog names the opportunity and applicant. 2) Cancel creates nothing. 3) Confirm creates a unique APP-### linked to the existing opportunity_id and student_id. 4) application_status = Submitted and submitted_at is recorded. 5) A second application for the same student and opportunity is blocked and the card shows "Application submitted". 6) The screen says that submitting does not approve a placement. |
| Screen | Student → apply dialog from an opportunity card. Fields shown: opportunity title, organization, OP ID, student name and student ID. Actions: Confirm, Cancel. |
| Data / handoff | Reads Opportunity, Student. Creates Application (Submitted) and Faculty review (REV-###, Available for review). Next role: Faculty Reviewer (Team 4). |
| Test | TC-STU-04 (cancel), TC-STU-05 (success), TC-STU-06 (duplicate blocked), TC-STU-07 (survives reload) |
| Dependency | Team 4 agrees that the review record is created at submission with review_status "Available for review". Owner: Team 4 integrator. Decide at today's Scrum of Scrums. |

### STU-03: Track my applications (IPP-09, Must)

| Item | Entry |
| --- | --- |
| Story link | IPP-09. Sprint 0 R-number: **to link** |
| Story | As a student, I want to view my applications so that I can follow their status. |
| Acceptance | 1) Shows application_id, opportunity and application_status. 2) Shows placement status separately as Not placed. 3) Application count and "applied" markers on cards update. |
| Screen | Student → My applications tab; summary card "My applications". |
| Data / handoff | Reads Application, Opportunity. Creates nothing. |
| Test | TC-STU-08 |
| Dependency | none |

### STU-04: Maintain my demo profile (IPP-10, Should)

| Item | Entry |
| --- | --- |
| Story link | IPP-10. Sprint 0 R-number: **to link** |
| Story | As a student, I want to view my profile and update my display name so that my information is recognizable. |
| Acceptance | 1) A nonblank display_name saves and shows everywhere the student appears. 2) Blank or spaces-only is rejected with a message. 3) student_id and seeded eligibility_status are visible. 4) The screen says eligibility verification is deferred. |
| Screen | Student → My profile tab. |
| Data / handoff | Updates Student.display_name. Faculty view reads the new name. |
| Test | TC-STU-09, TC-STU-10 |
| Dependency | none |

## Handoff check with Team 4

Submitted applications appear in the Faculty Reviewer view linked to the same student_id and opportunity_id. Joint test: TC-E2E-01, steps 4 and 5.

## Assumptions

- Team numbering follows the lab's sample structure (Team 1 = Student experience); the instructor raised no changes on 3 Nov.
- The student is Layla Hassan, COOP-B001, from the group brief (instructor, 3 Nov, D-05).
- Eligibility is displayed, not checked. Ineligible students are not blocked in Sprint 1.

## Estimates

Story points after team discussion: STU-01 __, STU-02 __, STU-03 __, STU-04 __.
