# Sprint 2 feature brief: FAQ chatbot and internship recommendations

**Team:** Team 1 (Student view). **Integrator:** Team 1 integrator. **Status:** built 17 Nov 2026; Product Owner sign-off on FAQ v1 pending (Team 1 Product Owner liaison).

## A. Value: goals and success criteria

| Feature | Goal | Success criterion 1 | Success criterion 2 |
| --- | --- | --- | --- |
| Internship FAQ chatbot | Students get correct, sourced answers to common internship questions inside IPP, without staff time, and never receive invented policy. | At least 5 approved questions are answered correctly and cite the right FAQ ID (target 5 of 5). | Every question outside the approved FAQ gets the co-op office handoff instead of an invented answer (target 100% of out-of-scope tests). |
| Matching engine | Each student sees three relevant internships with reasons they can check, to decide what to explore next. | For each of 3 synthetic profiles, the top recommendation is in the field the student said they want (target 3 of 3). | Every recommendation lists at least one reason and its skill gaps, and eligibility never changes the ranking (target: all recommendations; unit test passes). |

## User stories

| ID | Story | Acceptance |
| --- | --- | --- |
| AI-01 | As a student, I can read an FAQ with at least five approved answers, so I can solve common questions myself. | /faq lists 8 questions with ID, answer, category and source; marked synthetic, not official policy. |
| AI-02 | As a student, I can ask the help chatbot from any page and get an answer taken only from the approved FAQ, with its source shown. | Ask IPP opens the chat; each answer shows its FAQ ID chip and whether it came from the model or the offline lookup. |
| AI-03 | As a student, when my question is not covered, the chatbot says so and sends me to the co-op office instead of guessing. | GPA, pay and visa questions return the fixed handoff text; answers that cite no approved source are replaced by the handoff. |
| AI-04 | As a student, I see three internships ranked for my profile, each with reasons and skill gaps. | Student → Recommended shows ranks 1-3, a match score, "Why it fits" and "Gaps and notes". The chatbot gives the same order. |
| AI-05 | As a co-op coordinator, I need eligibility and placement to stay human decisions. | Eligibility is shown in a separate panel and not used in the score; every recommendation says it is not a placement. |
| AI-06 | As the Student, Employer and matching owners, we use one shared skill vocabulary, so equivalent terms match. | "Python programming" and "Python" both map to SK-PY-01; unmapped terms are kept for review, not dropped. |

## Out of scope for Sprint 2

Reading profiles from the class shared database, employer-entered skill fields, coordinator corrections to a recommendation, and logging chatbot questions for review. These are in the backlog for Sprint 3 (see sprint-board.md).
