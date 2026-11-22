# Matching rules (Sprint 2 baseline)

The matching engine is an editable rules baseline (`src/lib/ai/matching.ts`). It ranks every approved listing for one profile and shows the top three. The weights sit in one `WEIGHTS` object so the team can change them and rerun `bun run test`.

## Score

| Signal | Points |
| --- | --- |
| Required skill, reviewed | 3 |
| Required skill, self-declared | 2 |
| Desirable skill, reviewed | 1 |
| Desirable skill, self-declared | 0.5 |
| Listing field is one of the student's interests | 2 |
| Listing sector is one of the student's interests | 1 |
| Work mode matches the stated preference | 1 |
| Location matches the stated preference | 1 |

Score = points ÷ the most points that listing could give × 100. Ties go to more required skills matched, then the listing ID. Below 35% a recommendation is labelled **weak match**.

## Explanation

Each recommendation lists the required and desirable skills the student has (with their review status), the interest, sector, work mode and location matches, and its gaps: missing required skills, desirable skills to build, skills that count less until evidence is reviewed, and requirements inferred from text.

## What the engine never uses

- **Eligibility.** It is shown in its own panel ("checked separately by the co-op office") and is not part of the score. Unit test: changing eligibility leaves every rank and score unchanged.
- **Name, student ID, or any personal attribute.** Unit test: renaming the student leaves the scores unchanged.
- **Pending listings.** Only approved listings are ranked.

## Human control

A recommendation is decision support, not a placement. Applying stays a student action, eligibility is recorded by the co-op office, and official placements are approved by people. The chatbot adds this note to every recommendation answer, even if the model leaves it out.

## Known limits

- Only four synthetic profiles and eight listings; the weights are a first guess, not tuned on outcomes.
- Requirements for employer-added listings are inferred from text until the Employer form captures skills (backlog AI-09).
- Availability is recorded but not yet compared with listing dates.
