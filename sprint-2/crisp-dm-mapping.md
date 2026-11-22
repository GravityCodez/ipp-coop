# CRISP-DM / PMI-CPMAI phase mapping (Sprint 2)

Scrum and the Scrum of Scrums govern how the teams deliver; CRISP-DM and PMI-CPMAI guide what the AI features do and how they are checked.

| # | CRISP-DM | PMI-CPMAI | What Team 1 did for the IPP app | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Business Understanding | Business Understanding | One goal and two success criteria per feature. A good match means skills, field interest and work preferences line up; a good answer is correct, sourced and never invents policy. | feature-brief-ai.md |
| 2 | Data Understanding | Data Understanding | Listed what exists: Sprint 1 records (COOP-B001, OP-026 to OP-028), the course brief's synthetic thread (SK-JIRA-01, E-JIRA-01), and the app's own rules as FAQ sources. Found gaps: listings had no skill fields, and only one student existed. | sample-data.md |
| 3 | Data Preparation | Data Preparation | Built a shared skill vocabulary (14 SK- IDs with synonyms), four synthetic profiles (one with missing availability and preferences), requirement profiles for OP-026 to OP-028 and five sample listings. Unmapped skills are kept, not dropped. FAQ v1 written from the app rules. | src/lib/ai/knowledge.ts |
| 4 | Modeling | Model Development | Chatbot: a language model (Groq, openai/gpt-oss-120b; backup gpt-oss-20b) limited to the FAQ, the profile and the matching output, with an offline keyword lookup as fallback. Matching: an editable rules baseline with weights in one place. | src/lib/ai/chat.ts, matching.ts, matching-rules.md |
| 5 | Evaluation | Model Evaluation | 7 chatbot questions on 3 profiles, injection and out-of-scope tests, 3-profile matching check, 24 new unit tests (52 in total) (fairness: name and eligibility do not change ranks). One failure found and fixed. | test-report.md |
| 6 | Deployment | Model Operationalization | Embedded in IPP (Ask IPP on every page, FAQ page, Recommended tab). Key held only on the server. Deployed from GitHub main; the Lovable copy runs the offline lookup. Monitoring and coordinator review of answers planned for Sprint 3. | README.md, D-24 to D-27 |
