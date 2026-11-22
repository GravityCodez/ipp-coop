# Scrum of Scrums record: Sprint 1 kickoff (3 Nov 2026)

**Facilitator:** __  **Representatives:** Team 1 Scrum Master, Team 2 __, Team 3 __, Team 4 __  **Integrators:** Team 1 integrator, backup the data dictionary owner; other teams __
**Status:** updated 5 Nov 2026 from the build and test run 3. Outcomes show what was built; the other teams have not confirmed them yet.

## Dependencies

| # | Needed by | From | What | Needed by date | Fallback | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | All teams | Integrators | Shared foundation built and synced (B-00) | 4 Nov | Teams test their stories in the reference prototype meanwhile | Done 3 Nov (B-00) |
| 2 | Team 3 | Team 2 | New submissions start as Pending Review with all fields | Team 2 slot | Seed one Pending Review record for testing | Done: OP-028 starts Pending Review with all fields; Team 3 to confirm |
| 3 | Team 1 | Team 2 | HR form captures work_mode and duration (D-07) | Team 2 slot | Student cards show "not provided" | Done: form captures both; Team 1 accepted |
| 4 | Team 1 | Team 3 | Approval updates the same record, ID unchanged | Team 3 slot | Test with seeded Approved OP-026 | Done: OP-028 keeps its ID on approval |
| 5 | Team 4 | Team 1 | Application and REV-### created at submission (D-06) | Team 1 slot | Team 4 reads applications only and adds review records itself | Done: REV-028 created at submission; Team 4 to confirm |
| 6 | Everyone | Instructor | Approve Sprint 1 goal, team mapping, workspace and repo account (D-03, D-02, D-11, D-12) | 3 Nov | Proceed on the brief's defaults and record the risk | Answered 3 Nov; class Lovable plan still open (D-12) |

## Risks

| Risk | Response | Owner |
| --- | --- | --- |
| Free Lovable plan gives about 5 build credits a day for the whole class | Ask the instructor for the approved workspace; keep prompts bundled and reviewed; do not spend credits on retries without review | Project owner |
| Parallel edits overwrite each other in the master project | One build slot at a time, announced in Teams (D-08) | Integrators |
| A team changes shared fields or statuses inside its own prompt | Every prompt says "preserve the shared data model"; integrator checks the field list after each build | Integrators |
| R-numbers missing, so traceability fails at the demo | Each PO liaison links stories to the Sprint 0 backlog by 5 Nov | PO liaisons |
| "Applied" shown as "placed" | Placement status always separate, tested in TC-STU-08 and TC-FAC-02 | Teams 1 and 4 |

## Next tasks

See sprint-board.md, setup tasks S-01 to S-08.

## Decisions taken today

Copy agreed items into docs/decisions.md with "Agreed" and the date.

---

## What Team 1's representative needs to communicate to the other teams

**Tell everyone (all teams and integrators)**
1. The proposed data dictionary v1.1 (field names, ID formats, status spellings, seeds) and that nobody changes shared fields except through the Scrum of Scrums.
2. Team 1's build slot is 4th, after Teams 2 and 3, and what Team 1 needs before it starts.
3. The Lovable and GitHub setup facts: Lovable creates its own repository, so the empty ipp-master repo has to be replaced; the workspace is on the Free plan.
4. The project and repository links once they exist, with access owners and the backup integrator. Never credentials.

**Ask Team 2 (Employer HR)**
- Will your form capture work_mode and duration? Student cards must show them.
- Will a new organization get its own EMP-### instead of reusing EMP-001?
- Who is your integrator, and when do you expect to hand over?

**Ask Team 3 (University Admin)**
- Confirm that approval updates the existing record (same OP-###), and that only Approved records reach students.
- Are you adding anything beyond Pending Review and Approved this sprint? (The brief says no rejection or revision yet.)

**Ask Team 4 (Faculty Reviewer)**
- Agree that Team 1's submit action creates the review record (REV-###, "Available for review"), or tell us if you want to create it yourselves.
- Which fields must the faculty view show from the application, so that our records carry them?

**Instructor (lead PO): answers on 3 Nov 2026**
- Team numbering and Sprint 1 goal: no changes requested (D-02, D-03).
- Seed student: the group brief's Layla Hassan COOP-B001 thread (D-05).
- Personal GitHub account for ipp-master: acceptable (D-11).
- Class Lovable workspace or plan: to be discussed (D-12).
- P01 charter: revise to the Lab 3 Student scope (D-18).
- Still open: the two master-project integrators (D-09).

### Message ready to paste in the class Teams channel (updated 7 Nov, after test run 3 and dictionary v1.1)

> Hi all, Team 1 (Student) here with a Sprint 1 update.
>
> **All four roles now work in IPP - Master.** One new record goes from HR to Admin to Student to Faculty with the same IDs: OP-028 → APP-028 → REV-028. Test run 3: 25 of 25 cases pass, scripted and not yet repeated by hand. Results are in docs/test-cases.md and sprint-1/test-report.md in the class repo.
>
> **Shared data:** the instructor chose the group brief's records, and the app now uses them: student COOP-B001 Layla Hassan, opportunities OP-026 and OP-027, next OP-028, applications and reviews from 028. The data dictionary is now v1.1: eligibility_status is Eligible only for Sprint 1, and Faculty has its own table (D-23). No field name, ID format or status spelling changed. Shared fields only change through the Scrum of Scrums.
>
> **Please review your bundle:** to reach a working skeleton we entered the Employer HR, Admin and Faculty bundles using the instructor's bundle text (sprint-1/prompts/02, 03, 05). Please test your stories and tell us what you accept or want changed. You keep your slot for follow-up prompts.
>
> **Credits:** the Free workspace gives about 5 credits a day and a build costs about 1 to 4, so please send one reviewed prompt at a time. The class plan is still to be discussed with the instructor.
>
> **Please reply with:** your integrator's name and Lovable email, and any change you need to the shared fields. **Does any team have the consolidated Sprint 0 requirements register (FR-, NFR-, BR- numbers, called R-numbers in Lab 3)?** Team 1 cannot find it and every team needs it for traceability.
