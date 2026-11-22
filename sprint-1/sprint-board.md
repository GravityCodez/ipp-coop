# Sprint 1 board

**Sprint 1:** 4 to 10 Nov 2026 (proposed). Demo at the next lab. **Goal:** see docs/requirements.md.
Status values: To do, In progress, Review, Done (Done = acceptance passes in the integrated app, evidence linked).

## Setup and coordination

| ID | Task | Owner | Due | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| S-01 | Agree data dictionary v1, statuses and seeds (D-04 to D-07) | Scrum of Scrums reps | 3 Nov | Review: built into the app; dictionary now v1.1 (D-23); other teams to confirm | decisions.md |
| S-02 | Name the two master-project integrators and the backup (D-09) | All teams | 3 Nov | In progress: Team 1 named its integrator, with the data dictionary owner as backup; other teams to name theirs | D-19 |
| S-03 | Create Lovable project "IPP – Master"; invite integrators as editors | Project owner | 3 Nov | Done: created and named "IPP - Master". Invite other teams' integrators as editors once named. Team 1's backup integrator asked for editor access 7 Nov; not added yet | https://lovable.dev/projects/ec4da18f-8741-4ec6-a49e-b63b8a1fb3e3 |
| S-04 | Connect IPP – Master to GitHub; rename repo to ipp-master; add integrators | Repository owner | 3 Nov | Done: synced to GravityCodez/ipp-master; collaborators added | head 04ae36b |
| S-05 | Confirm sync with a small reversible change | Lead integrator | 3 Nov | Done: Lovable builds 04 and the README landed on GitHub; docs pushed from GitHub show in Lovable | commit log |
| S-06 | Post project URL, repo URL, access owners and backup integrator in Teams (no credentials) | Repository owner | 3 Nov | Team 1 chat done 5 Nov (repo links, app link, backup integrator); class channel post still to do | Teams post |
| S-07 | Add docs/ and sprint-1/ to the repository | Repository owner | 4 Nov | Done 3 Nov | commit link |
| S-08 | Link every selected story to its Sprint 0 requirement number | Each team PO liaison (Team 1: Team 1 Product Owner liaison) | 5 Nov | Blocked: consolidated Sprint 0 register not found; ask the Scrum of Scrums and instructor | requirements.md |

## Team 1 tasks (Scrum Master's split, team chat, 3 Nov)

| ID | Task | Owner | Due | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| T1-01 | Task board, minutes, Scrum of Scrums with other team PMs, charter resubmission | Team 1 Scrum Master | Ongoing | In progress | Charter v0.3 draft |
| T1-02 | Integrate through Lovable; repo; share an app link for the team | Team 1 integrator | Sprint 1 | In progress: all builds done; app published at https://ipp-master.lovable.app; link posted in the team chat 5 Nov | prompt-log.md |
| T1-03 | Check STU-01..04 against acceptance; link Sprint 0 numbers | Team 1 Product Owner liaison | 5 Nov | Checks repeated 5 Nov on the new records, with a page reload: all pass; links blocked (S-08) | Team chat, requirements.md |
| T1-04 | Repeat TC-STU-01..10 by hand on the new records; phone and keyboard checks; plan peer usability tests (3+ people outside Team 1) | Team 1 QA owner | 10 Nov | To do | test-cases.md |
| T1-05 | Keep Student and Application fields correct after each build; learn the prompt process as backup | Team 1 data dictionary owner | Each build | Done for the current build, 7 Nov: fields match main 4f007a0 and the published link; dictionary updated to v1.1. Repeat after each build | data-dictionary.md, PR #1 (fa495d9) |
| T1-06 | Review Student screens and send fix prompts to the integrator; Sprint 1 review PowerPoint | Team 1 UI owner | 10 Nov | To do: owner expects to update by the weekend (team chat, 5 Nov); small fixes K-08 to K-10 added to the list | Team chat, test-cases.md |
| T1-07 | Send hours per week, daily scrum times, dates away, invite status; share individual IPP stages 0-3 (not 4D) | All members | 5 Nov, 8 pm | the integrator posted 6 Nov and the data dictionary owner 7 Nov; other members not yet in the team chat as of 7 Nov, 10:06 (reminder from the Scrum Master, 6 Nov) | Team chat |

## Build (in this order, one integrator at a time)

| ID | Item | Stories | Owner | Status | Tests |
| --- | --- | --- | --- | --- | --- |
| B-00 | Shared foundation | IPP-13, IPP-14, IPP-15 | Project owner | Done: TC-SH-01..03 pass | TC-SH-01..03 |
| B-02 | Employer HR bundle | EMP-01..03 | Project owner for Team 2 (D-15) | Review: built, TC-EMP-01..04 pass in run 3; Team 2 to accept | TC-EMP-01..04 |
| B-03 | University Admin bundle | ADM-01..03 | Project owner for Team 3 (D-15) | Review: built, TC-ADM-01..03 pass in run 3; Team 3 to accept | TC-ADM-01..03 |
| B-01 | Student bundle | STU-01..04 | Team 1 | Review: TC-STU-01..10 pass in run 3; PO liaison re-checked STU-01..04 on the new records 5 Nov, all pass; QA hand repeat to do | TC-STU-01..10 |
| B-04 | Faculty bundle | FAC-01..03 | Project owner for Team 4 (D-15) | Review: built 5 Nov (2007788), TC-FAC-01..03 pass in run 3; Team 4 to accept | TC-FAC-01..03 |
| B-06 | Switch seeds and IDs to the group brief (D-05) | Prompt 07 | Project owner | Done: a375503; run 3 passes | TC-SH-03, TC-STU-01, TC-E2E-01 |
| B-05 | Integrated acceptance and reset | IPP-16 | All teams | Review: built 5 Nov (21ffb54), TC-E2E-01..02 pass in run 3; teams to accept | TC-E2E-01..02 |

## Sprint 1 evidence checklist (lab section 10)

- [x] Live demo of all four roles with the same record carried through (run 3: OP-028 → APP-028 → REV-028; records live in one browser, so demo from one browser)
- [x] Sprint backlog: story IDs, owners, priorities, acceptance checks
- [ ] Traceability: R-number → story → screen → test result (results filled; requirement numbers blocked, S-08)
- [x] Data dictionary v1.1 and assumptions and risks
- [x] Links: Lovable project, GitHub repository, prompt log
- [x] Test report: pass, fail or unverified per acceptance check; limitations listed (run 3, see sprint-1/test-report.md)
- [x] One-page Scrum of Scrums record (build outcomes filled in; other teams' confirmations still open)
