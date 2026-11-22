# Sprint 2: MVP with AI features (demo 17 Nov 2026, 08:30, in class)

Brief: "Lab 4 - Sprint 2 - AI integration" (Moodle, Week 12: lab PDF and slides). Sprint 1 tested a walking skeleton; Sprint 2 adds two AI features to the same IPP app: an **internship FAQ chatbot** and **ranked internship recommendations**, planned with CRISP-DM / PMI-CPMAI and coordinated through the Scrum of Scrums.

## Links

| Item | Link |
| --- | --- |
| Working app (GitHub deploy, chatbot answers with Groq) | https://ipp-master.onrender.com (see [D-27](../docs/decisions.md); first visit after 15 idle minutes takes about a minute) |
| Working app (Lovable publish, chatbot in FAQ lookup mode) | https://ipp-master.lovable.app |
| GitHub repository | https://github.com/GravityCodez/ipp-master (private; collaborators added) |
| Where to look in the app | Student → **Recommended** tab; **FAQ & chatbot** in the sidebar; **Ask IPP** button on every page |

## Brief activities → evidence

| Brief activity | Required work | Evidence | State |
| --- | --- | --- | --- |
| A. Define the value | One goal and two success criteria for the chatbot and the matching engine | [feature-brief-ai.md](feature-brief-ai.md) | Done |
| B. Prepare sample data | Student skills, internship requirements, approved FAQ/policy sources; synthetic records; missing or uncertain information recorded | [sample-data.md](sample-data.md), `src/lib/ai/knowledge.ts` | Done |
| C. Build prototypes | Chatbot answers five approved questions; matching returns three internships with reasons | `/faq`, Ask IPP, Student → Recommended; [matching-rules.md](matching-rules.md) | Done |
| D. Test and improve | Five chatbot questions, three sample profiles, one failure or limitation, corrective action, human review step | [test-report.md](test-report.md) | Done (integrator run); QA hand repeat to do |
| E. Coordinate integration | Data fields, API or embed method, repository ownership, dependencies with Student and Employer teams; SoS minutes | [scrum-of-scrums.md](scrum-of-scrums.md), [../docs/decisions.md](../docs/decisions.md) D-24 to D-27 | Proposed; to confirm at the SoS |
| Plan | CRISP-DM / PMI-CPMAI phase mapping | [crisp-dm-mapping.md](crisp-dm-mapping.md) | Done |
| Backlog | Unified product backlog updates | [sprint-board.md](sprint-board.md) | Done |

## Minimum acceptance criteria (brief section 4)

| Criterion | How the app meets it | Check |
| --- | --- | --- |
| Chatbot is accessible from the IPP application | Ask IPP button on every page and the FAQ & chatbot page | AI-02 |
| Answers five approved internship questions and handles unknown policy questions without inventing answers | Server route sends only the approved FAQ, the synthetic profile and the matching output to the model; unknown questions get the fixed co-op office handoff; offline lookup if the model is down | AI-02, AI-03 |
| Matching shows three ranked opportunities with clear reasons; eligibility checked separately | Recommended tab and chatbot; eligibility shown in its own panel and excluded from the score | AI-04, AI-05 |
| Demo uses synthetic or authorized data only | All profiles, listings and FAQ answers are synthetic; the chat panel warns users not to enter personal information | sample-data.md |
| Dependencies reported, unified backlog updated; human approval required for official placements | SoS draft and sprint board; every recommendation says it is not a placement | scrum-of-scrums.md, sprint-board.md |

## Sprint review submission (brief section 5)

Six slides at most, plus the working URL and the GitHub link: (1) goals and user stories, (2) CRISP-DM / PMI-CPMAI mapping, (3) sample data and sources, (4) chatbot and matching demonstration, (5) test results and human safeguards, (6) SoS coordination, backlog updates and next steps (the slides also ask for a word on continuous improvement).
