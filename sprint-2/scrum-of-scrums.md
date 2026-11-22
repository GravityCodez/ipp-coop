# Scrum of Scrums record: Sprint 2 AI integration

**Prepared by:** Team 1 (integrator and Scrum of Scrums representative), 17 Nov 2026.
**Status:** proposed by Team 1 for the next SoS. Attendees, decisions and owners from other teams are blank until the meeting confirms them.

**Attendees:** Team 1 Scrum Master; Employer team __; other IPP teams __; class data owner (shared database) __.

## Minutes (fields from the Sprint 2 slides)

| Field | Entry |
| --- | --- |
| Teams / attendees | Student (Team 1), Employer, other IPP teams, shared database owner: to confirm |
| Dependency | Matching needs one skills vocabulary for student profiles and listings; the Employer form has no skill fields yet |
| Decision (proposed) | Use the SK- skill IDs in sprint-2/sample-data.md for synthetic records (D-26); Employer listings add required and desirable skill IDs |
| Action / owner | Employer team: add skill fields to the HR form (AI-09). Team 1: map the shared database's P01 skills to SK- IDs (AI-10). Owners to confirm |
| Backlog change | Added AI-01 to AI-12 to the unified backlog (sprint-board.md) |
| Next check | The deployed matching engine reads one shared-database profile and one employer listing with skill fields (Sprint 3) |

## Dependencies

| # | Needed by | From | What | Fallback now | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | Matching | Employer team | Required and desirable skills on each listing | Requirements inferred from listing text, flagged in the explanation | Open |
| 2 | Matching | Class shared database (P01 records) | Profiles with skills per version, e.g. COOP-P001 v3 | Four synthetic fixtures in the app | Open; Team 1 added COOP-P001 to the shared database on 16 Nov |
| 3 | Chatbot | Product Owner (Team 1 Product Owner liaison) | Sign-off on FAQ v1 and on each later change | FAQ marked "sign-off pending" | Open |
| 4 | Everyone | Repository owner | Code changes via GitHub `main` as well as Lovable (D-24) | Lovable only | Proposed |

## Integration method (brief activity E)

| Item | Proposal |
| --- | --- |
| Data fields | Profile: student_id, profile_version, interests, availability, preferred_work_mode, preferred_location, skills[{skill_id, status, evidence_id}]. Listing: required_skills[], desirable_skills[], field, sector. Recommendation: rank, opportunity_id, score, reasons[], gaps[] |
| API or embed | Embedded in the IPP app. `POST /api/chat` with `{messages, profile_id, data}` returns `{answer, sources, kind, mode}`; `GET /api/chat` reports whether the model is on. Matching runs in the app (`recommend()`), so other views can reuse it |
| Repository ownership | GravityCodez/ipp-master, `main`; Team 1 integrator merges; other teams send PRs or issues |
| Secrets | Groq key only in the host's environment (Render), never in code, prompts, Teams or the repository |

## Risks

| Risk | Response | Owner |
| --- | --- | --- |
| The model invents policy | Approved FAQ only, fixed handoff text, answers citing no source replaced by the handoff, offline lookup fallback | Team 1 |
| Free-tier rate limits during the class demo | Backup model, then offline lookup | Team 1 |
| A recommendation is read as an offer or placement | Not-a-placement note on every recommendation; eligibility shown separately | Team 1 |
| Real student data typed into the chat | Warning in the chat panel; nothing is stored on the server | Team 1 |
