# Sprint 2 board and unified backlog updates

**Sprint 2:** 10 to 17 Nov 2026; demo 17 Nov, 08:30, in class. **Goal:** add the FAQ chatbot and ranked recommendations to the IPP MVP. Status values as in Sprint 1 (To do, In progress, Review, Done = acceptance passes in the integrated app with evidence linked). Owners marked "proposed" have not confirmed yet.

## Stories

| ID | Story | Owner | Status | Evidence |
| --- | --- | --- | --- | --- |
| AI-01 | FAQ page with at least five approved answers | Team 1 integrator (build); Team 1 Product Owner liaison (sign-off, proposed) | Review: built with 8 questions; PO sign-off pending | /faq, test-report.md |
| AI-02 | Help chatbot on every page, answers only from the FAQ with sources | Team 1 integrator | Done (integrator run); QA hand repeat to do | AI-T01 to AI-T05, AI-T09 |
| AI-03 | Unknown policy questions handed to the co-op office | Team 1 integrator | Done | AI-T07, AI-T08 |
| AI-04 | Three ranked recommendations with reasons and gaps | Team 1 integrator | Done | Recommended tab, AI-T06 |
| AI-05 | Eligibility separate; not-a-placement note | Team 1 integrator | Done | matching-rules.md, unit tests |
| AI-06 | Shared skill vocabulary (SK- IDs) | Team 1 integrator; Team 1 data dictionary owner to add to the data dictionary (proposed) | Review | sample-data.md |

## Sprint 2 tasks

| ID | Task | Owner | Status |
| --- | --- | --- | --- |
| S2-01 | Repeat AI-T01 to AI-T09 by hand on the deployed app, phone width included | Team 1 QA owner (proposed) | To do |
| S2-02 | Sign off FAQ v1 or send changes | Team 1 Product Owner liaison (proposed) | To do |
| S2-03 | Six-slide Sprint 2 review deck and presenter | Team to decide | Draft deck posted in the team chat 17 Nov; presenter open |
| S2-04 | Take the SoS proposals (scrum-of-scrums.md) to the next Scrum of Scrums | Team 1 Scrum Master (proposed) | To do |
| S2-05 | Add Sprint 2 fixture fields to the data dictionary as v1.2 (proposed) | Team 1 data dictionary owner (proposed) | To do |
| S2-06 | Deploy from GitHub with the key on the server (D-27) | Team 1 integrator | Done 17 Nov: https://ipp-master.onrender.com |

## Backlog added for Sprint 3

| ID | Item | Depends on |
| --- | --- | --- |
| AI-07 | Read student profiles from the class shared database instead of fixtures | Shared database owner, SoS |
| AI-08 | Coordinator can question or correct a recommendation input and rerun matching | AI-07 |
| AI-09 | Employer form captures required and desirable skill IDs | Employer team |
| AI-10 | Map P01 shared-database skills to SK- IDs; unmapped terms go to review | AI-06 |
| AI-11 | Label weak matches in the chatbot text on the server; decide whether to hide matches under 35% | F-3 in test-report.md |
| AI-12 | Log questions the chatbot could not answer for coordinator review and FAQ updates | PO |

## Continuous improvement (from Sprint 1)

Sprint 1 ran out of Lovable credits mid-build. Sprint 2 code changes went through GitHub with tests run before each push, so builds no longer depend on daily credits. Test results are recorded with the commit they ran on.
